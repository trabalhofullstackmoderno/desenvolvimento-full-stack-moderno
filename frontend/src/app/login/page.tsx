"use client";

import GoogleIcon from "@mui/icons-material/Google";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('accessToken') || new URLSearchParams(window.location.search).get('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

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
            bgcolor: "rgba(112, 235, 218, 0.96)",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ color: 'white' }}
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
