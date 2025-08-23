import React from 'react';
import { Container, TextField, Button, Box, Typography, Paper } from '@mui/material';

export default function Page() {
  return (
    <Box
      sx={{
        backgroundImage: 'url(/imagens/fundo1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Login Para o chat
          </Typography>
          <Box component="form" noValidate autoComplete="off">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Entrar com o Google
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
