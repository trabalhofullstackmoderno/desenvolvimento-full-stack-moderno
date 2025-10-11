"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material'
import PushNotificationService from '@/services/push-notification-service'

const NotificationSetup: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pushService = PushNotificationService.getInstance()

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    await pushService.init()
    setIsSupported(pushService.isNotificationSupported())
    setPermission(pushService.getPermissionStatus())
    setIsSubscribed(pushService.getSubscriptionStatus())
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const permissionGranted = await pushService.requestPermission()
      if (!permissionGranted) {
        setError('Notification permission denied')
        return
      }

      const subscribed = await pushService.subscribe()
      if (subscribed) {
        setIsSubscribed(true)
        setPermission('granted')
      } else {
        setError('Failed to subscribe to push notifications')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      setError('Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const unsubscribed = await pushService.unsubscribe()
      if (unsubscribed) {
        setIsSubscribed(false)
      } else {
        setError('Failed to disable notifications')
      }
    } catch (error) {
      console.error('Error disabling notifications:', error)
      setError('Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsOffIcon color="disabled" sx={{ mr: 2 }} />
            <Typography variant="h6">Push Notifications</Typography>
          </Box>
          <Alert severity="warning">
            Push notifications are not supported in this browser.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon color={isSubscribed ? 'primary' : 'disabled'} sx={{ mr: 2 }} />
          <Typography variant="h6">Push Notifications</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get notified when you receive new emails, even when the app is closed.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isSubscribed && permission === 'granted'}
                onChange={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                disabled={loading}
              />
            }
            label={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
          />

          {permission === 'denied' && (
            <Typography variant="caption" color="error">
              Notifications blocked. Please enable in browser settings.
            </Typography>
          )}
        </Box>

        {!isSubscribed && permission !== 'denied' && (
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={handleEnableNotifications}
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? 'Setting up...' : 'Enable Email Notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationSetup