"use client";

import { Box, Avatar, IconButton, Typography, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function Sidebar() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Avatar alt="Você" src="/avatar.png" />
        <Box>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1,
          borderBottom: "1px solid #ddd",
        }}
      >
        <SearchIcon sx={{ color: "gray", mr: 1 }} />
        <InputBase placeholder="Procurar conversa" fullWidth />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1.5,
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <Avatar sx={{ mr: 2 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Contato {i + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última mensagem...
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
