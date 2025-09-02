"use client";

import { Box } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import Chat from "@/components/layout/Chat";
import { useState } from "react";

export default function HomePage() {
  const contatoAtual = useState({})
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f0f2f5" }}>
      <Box sx={{ width: 350, borderRight: "1px solid #ddd", bgcolor: "white" }}>
        <Sidebar />
      </Box>

      <Box sx={{ flex: 1, bgcolor: "#ece5dd" }}>
        <Chat  />
      </Box>
    </Box>
  );
}
