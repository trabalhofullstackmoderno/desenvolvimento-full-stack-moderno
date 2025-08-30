"use client";

import { Box, Paper, Typography, Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginPage() {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 40%" },
          display: "flex",
        }}
      >
        <Paper
          elevation={6}
          square
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 6,
            bgcolor: "rgba(248, 248, 248, 0.96)",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            Acesso ao Chat
          </Typography>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            href="http://localhost:3333/login/google"
            sx={{
              mt: 4,
              py: 1.5,
              bgcolor: "#4285F4",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#357ae8",
              },
            }}
          >
            Entrar com o Google
          </Button>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: { xs: "0 0 0%", md: "1 1 60%" },
          backgroundImage: "url(/imagens/fundo1.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </Box>
  );
}
