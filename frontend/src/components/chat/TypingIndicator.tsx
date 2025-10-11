"use client"

import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Paper,
  keyframes
} from '@mui/material'

interface TypingIndicatorProps {
  userName: string
  avatar?: string
}

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
`

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName, avatar }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 1,
        alignItems: 'flex-end'
      }}
    >
      <Avatar
        src={avatar}
        alt={userName}
        sx={{
          width: 32,
          height: 32,
          mr: 1
        }}
      >
        {userName[0]?.toUpperCase()}
      </Avatar>

      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'white',
            borderBottomLeftRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'text.secondary',
                  animation: `${bounce} 1.4s infinite ease-in-out`,
                  animationDelay: `${i * 0.16}s`
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {userName} is typing...
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default TypingIndicator