import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'admin@example.com'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

export class PushNotificationService {
  async subscribePush(userId: string, subscription: PushSubscriptionData): Promise<void> {
    try {
      await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId,
            endpoint: subscription.endpoint
          }
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      })
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      throw new Error('Failed to subscribe to push notifications')
    }
  }

  async unsubscribePush(userId: string, endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint
        }
      })
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      throw new Error('Failed to unsubscribe from push notifications')
    }
  }

  async sendNotificationToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      })

      const promises = subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          )
        } catch (error) {
          console.error('Error sending notification to subscription:', error)

          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id }
            })
          }
        }
      })

      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Error sending notifications to user:', error)
      throw new Error('Failed to send notifications')
    }
  }

  async notifyNewEmail(userId: string, fromEmail: string, subject: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'New Email Received',
      body: `From: ${fromEmail}\nSubject: ${subject || 'No Subject'}`,
      icon: '/icons/email-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        type: 'new_email',
        fromEmail,
        subject
      }
    }

    await this.sendNotificationToUser(userId, payload)
  }

  getVapidPublicKey(): string {
    return vapidKeys.publicKey
  }
}