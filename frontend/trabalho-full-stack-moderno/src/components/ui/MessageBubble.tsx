"use client";

import { Box, Typography } from "@mui/material";

interface MessageBubbleProps {
  text: string;
  sender: "me" | "outro";
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isMe = sender === "me";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: "60%",
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: isMe ? "#dcf8c6" : "white",
          boxShadow: 1,
        }}
      >
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Box>
  );
}
