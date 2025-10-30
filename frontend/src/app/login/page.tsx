"use client";

import GoogleIcon from "@mui/icons-material/Google";
import { Box, Button, Paper, Typography, Alert } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('accessToken') || searchParams.get('token');
    if (token) {
      router.push('/');
    }

    // Check for error messages from backend
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error === 'domain_not_allowed' && message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [router, searchParams]);

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

          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                mb: 2,
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{
              color: 'white',
              mb: 3,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              p: 2,
              borderRadius: 1
            }}
          >
            Acesso restrito a usuários com email @sou.fae.br
          </Typography>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/login/google`}
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
