import { google } from 'googleapis'
import * as nodemailer from 'nodemailer'
import Imap from 'imap'
import { ParsedMail, simpleParser } from 'mailparser'
import { decryptToken } from '@/http/controllers/users/authenticate'
import { prisma } from '@/lib/prisma'

export interface SendEmailData {
  to: string
  cc?: string[]
  bcc?: string[]
  subject: string
  textBody?: string
  htmlBody?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailData {
  id: string
  threadId: string
  from: string
  to: string
  cc?: string[]
  bcc?: string[]
  subject?: string
  textBody?: string
  htmlBody?: string
  isRead: boolean
  isStarred: boolean
  labels: string[]
  attachments: any[]
  sentAt: Date
  gmailId: string
}

export class EmailService {
  async sendEmail(userId: string, emailData: SendEmailData): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true, email: true }
    })

    if (!user?.accessToken) {
      throw new Error('User access token not found')
    }

    const accessToken = decryptToken(user.accessToken)

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const emailLines = [
      `From: ${user.email}`,
      `To: ${emailData.to}`,
      ...(emailData.cc?.length ? [`Cc: ${emailData.cc.join(', ')}`] : []),
      ...(emailData.bcc?.length ? [`Bcc: ${emailData.bcc.join(', ')}`] : []),
      `Subject: ${emailData.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      emailData.htmlBody || emailData.textBody || ''
    ]

    const email = emailLines.join('\r\n')
    const encodedEmail = Buffer.from(email).toString('base64url')

    try {
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  async syncEmails(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true, email: true }
    })

    if (!user?.accessToken) {
      throw new Error('User access token not found')
    }

    const accessToken = decryptToken(user.accessToken)

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    try {
      // Get threads from Gmail
      const threadsResponse = await gmail.users.threads.list({
        userId: 'me',
        maxResults: 50
      })

      const threads = threadsResponse.data.threads || []

      for (const thread of threads) {
        if (!thread.id) continue

        // Get thread details
        const threadDetails = await gmail.users.threads.get({
          userId: 'me',
          id: thread.id
        })

        const messages = threadDetails.data.messages || []
        if (messages.length === 0) continue

        const lastMessage = messages[messages.length - 1]
        const subject = this.extractHeader(lastMessage.payload?.headers, 'Subject') || ''
        const lastEmailDate = new Date(parseInt(lastMessage.internalDate || '0'))

        // Upsert thread
        const emailThread = await prisma.emailThread.upsert({
          where: {
            userId_threadId: {
              userId,
              threadId: thread.id
            }
          },
          create: {
            userId,
            threadId: thread.id,
            subject,
            lastEmail: lastEmailDate
          },
          update: {
            subject,
            lastEmail: lastEmailDate
          }
        })

        // Process each message in the thread
        for (const message of messages) {
          if (!message.id || !message.payload) continue

          const fromEmail = this.extractHeader(message.payload.headers, 'From') || ''
          const toEmail = this.extractHeader(message.payload.headers, 'To') || ''
          const ccEmails = this.extractHeader(message.payload.headers, 'Cc')?.split(',').map(e => e.trim()) || []
          const bccEmails = this.extractHeader(message.payload.headers, 'Bcc')?.split(',').map(e => e.trim()) || []
          const subject = this.extractHeader(message.payload.headers, 'Subject') || ''
          const sentAt = new Date(parseInt(message.internalDate || '0'))

          const body = this.extractBody(message.payload)

          // Check if message already exists
          const existingEmail = await prisma.email.findUnique({
            where: { gmailId: message.id }
          })

          if (!existingEmail) {
            // Determine sender and recipient IDs
            const senderId = fromEmail.includes(user.email) ? userId : null
            const recipientId = toEmail.includes(user.email) ? userId : null

            await prisma.email.create({
              data: {
                threadId: emailThread.id,
                senderId,
                recipientId,
                fromEmail,
                toEmail,
                ccEmails,
                bccEmails,
                subject,
                textBody: body.text,
                htmlBody: body.html,
                gmailId: message.id,
                isRead: message.labelIds?.includes('UNREAD') ? false : true,
                isStarred: message.labelIds?.includes('STARRED') || false,
                labels: message.labelIds || [],
                attachments: [],
                sentAt
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error syncing emails:', error)
      throw new Error('Failed to sync emails')
    }
  }

  async getThreads(userId: string, limit = 20, offset = 0): Promise<any[]> {
    const threads = await prisma.emailThread.findMany({
      where: { userId },
      include: {
        emails: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastEmail: 'desc' },
      skip: offset,
      take: limit
    })

    return threads.map(thread => ({
      id: thread.id,
      threadId: thread.threadId,
      subject: thread.subject,
      lastEmail: thread.lastEmail,
      latestEmailPreview: thread.emails[0]?.textBody?.substring(0, 150) || '',
      emailCount: thread.emails.length
    }))
  }

  async getThreadById(userId: string, threadId: string): Promise<any> {
    const thread = await prisma.emailThread.findFirst({
      where: {
        userId,
        id: threadId
      },
      include: {
        emails: {
          orderBy: { sentAt: 'asc' }
        }
      }
    })

    if (!thread) {
      throw new Error('Thread not found')
    }

    return {
      id: thread.id,
      threadId: thread.threadId,
      subject: thread.subject,
      lastEmail: thread.lastEmail,
      emails: thread.emails
    }
  }

  async searchEmails(userId: string, query: string, limit = 20): Promise<any[]> {
    const emails = await prisma.email.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ],
        AND: {
          OR: [
            { subject: { contains: query, mode: 'insensitive' } },
            { textBody: { contains: query, mode: 'insensitive' } },
            { fromEmail: { contains: query, mode: 'insensitive' } },
            { toEmail: { contains: query, mode: 'insensitive' } }
          ]
        }
      },
      include: {
        thread: true
      },
      orderBy: { sentAt: 'desc' },
      take: limit
    })

    return emails
  }

  async markAsRead(userId: string, emailId: string): Promise<void> {
    await prisma.email.updateMany({
      where: {
        id: emailId,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      data: { isRead: true }
    })
  }

  private extractHeader(headers: any[] | undefined, name: string): string | undefined {
    if (!headers) return undefined
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase())
    return header?.value
  }

  private extractBody(payload: any): { text?: string; html?: string } {
    let text = ''
    let html = ''

    const extractFromPart = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64').toString('utf-8')
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += Buffer.from(part.body.data, 'base64').toString('utf-8')
      }

      if (part.parts) {
        part.parts.forEach(extractFromPart)
      }
    }

    if (payload.body?.data) {
      if (payload.mimeType === 'text/plain') {
        text = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      } else if (payload.mimeType === 'text/html') {
        html = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      }
    }

    if (payload.parts) {
      payload.parts.forEach(extractFromPart)
    }

    return { text: text || undefined, html: html || undefined }
  }
}