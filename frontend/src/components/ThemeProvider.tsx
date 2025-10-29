"use client";

import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { unifaeTheme } from '@/theme/unifaeTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={unifaeTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}