"use client";

import { Box, Typography } from "@mui/material";
import ChatHeader from "../ui/ChatHeader";
import MessageBubble from "../ui/MessageBubble";
import MessageInput from "../ui/MessageInput";

export default function Chat() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ChatHeader />

      <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
        <MessageBubble text="Oi! Tudo bem?" sender="outro" />
        <MessageBubble text="Tudo sim e você?" sender="me" />
        <MessageBubble text="Trabalhando no projeto 🚀" sender="me" />
      </Box>

      <MessageInput />
    </Box>
  );
}
