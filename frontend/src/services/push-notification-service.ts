import axios from '@/auth/axios'

class PushNotificationService {
  private static instance: PushNotificationService
  private vapidPublicKey: string | null = null
  private isSupported: boolean
  private isSubscribed: boolean = false

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async init(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported')
      return
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)

      // Get VAPID public key
      const response = await axios.get('/push/vapid-public-key')
      this.vapidPublicKey = response.data.publicKey

      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription()
      this.isSubscribed = !!existingSubscription

      console.log('Push notification service initialized')
    } catch (error) {
      console.error('Error initializing push notifications:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async subscribe(): Promise<boolean> {
    if (!this.isSupported || !this.vapidPublicKey) {
      console.warn('Push notifications not supported or VAPID key not available')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        this.isSubscribed = true
        return true
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      // Send subscription to server
      await axios.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      })

      this.isSubscribed = true
      console.log('Push notification subscription created')
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe()

        // Remove subscription from server
        await axios.delete('/push/unsubscribe', {
          data: { endpoint: subscription.endpoint }
        })

        this.isSubscribed = false
        console.log('Push notification subscription removed')
      }

      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied'
    }
    return Notification.permission
  }

  isNotificationSupported(): boolean {
    return this.isSupported
  }

  getSubscriptionStatus(): boolean {
    return this.isSubscribed
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export default PushNotificationService