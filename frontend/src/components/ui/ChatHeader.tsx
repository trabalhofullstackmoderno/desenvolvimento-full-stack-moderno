"use client";

import { Box, Avatar, Typography, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ChatHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1,
        borderBottom: "1px solid #ddd",
        bgcolor: "white",
      }}
    >
      <Avatar sx={{ mr: 2 }} />
      <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
        Contato Exemplo
      </Typography>
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
}
