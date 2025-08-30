"use client";

import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function MessageInput() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        borderTop: "1px solid #ddd",
        bgcolor: "white",
      }}
    >
      <TextField
        placeholder="Digite uma mensagem"
        fullWidth
        size="small"
        sx={{ mr: 1 }}
      />
      <IconButton color="primary">
        <SendIcon />
      </IconButton>
    </Box>
  );
}
