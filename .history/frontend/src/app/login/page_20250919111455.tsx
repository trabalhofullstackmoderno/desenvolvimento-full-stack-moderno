"use client";

import { Box, Paper, Typography, Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { Chat as ChatIcon } from "@mui/icons-material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
            bgcolor: "rgba(248, 248, 248, 0.96)",
          }}
        >
          <ChatIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography
            component="h1"
            variant="h4"
            fontWeight="bold"
            gutterBottom
          >
            WhatsApp-Style Chat
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4, maxWidth: 300 }}
          >
            Connect with your Google contacts and start chatting in real-time
          </Typography>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            href="http://localhost:3333/login/google"
            sx={{
              mt: 2,
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
            Sign in with Google
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            We'll sync your Google contacts to find friends using this app
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: { xs: "0 0 0%", md: "1 1 60%" },
          bgcolor: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "white",
          p: 4
        }}
      >
        <ChatIcon sx={{ fontSize: 120, mb: 3, opacity: 0.8 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Real-time Chat
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, textAlign: 'center', maxWidth: 400 }}>
          Send messages instantly to your Google contacts who are using this app
        </Typography>
      </Box>
    </Box>
  );
}
