"use client"

import React from 'react'
import { Box } from '@mui/material'
import EmailInbox from '@/components/email/EmailInbox'

export default function EmailPage() {
  return (
    <Box sx={{ height: '100vh' }}>
      <EmailInbox />
    </Box>
  )
}