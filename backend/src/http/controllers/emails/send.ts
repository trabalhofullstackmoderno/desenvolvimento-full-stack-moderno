import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { EmailService } from '@/services/email-service'

const sendEmailBodySchema = z.object({
  to: z.string().email(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string(),
  textBody: z.string().optional(),
  htmlBody: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional()
  })).optional()
})

export async function sendEmail(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const emailData = sendEmailBodySchema.parse(request.body)

    const emailService = new EmailService()

    const attachments = emailData.attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.contentType
    }))

    await emailService.sendEmail(userId, {
      ...emailData,
      attachments
    })

    return reply.status(201).send({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}