import { createTheme } from '@mui/material/styles';

// UNIFAE Color Palette
const unifaeColors = {
  primary: '#735CFD',    // Roxo principal da UNIFAE
  secondary: '#00FFF2',  // Azul neon/ciano
  dark: '#121417',       // Fundo escuro
  darkPurple: '#2B0F35', // Roxo escuro
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  gray: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3'
};

export const unifaeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: unifaeColors.primary,
      light: '#8B7BFF',
      dark: '#5A47E0',
      contrastText: unifaeColors.white,
    },
    secondary: {
      main: unifaeColors.secondary,
      light: '#33FFF4',
      dark: '#00CCB8',
      contrastText: unifaeColors.dark,
    },
    background: {
      default: unifaeColors.lightGray,
      paper: unifaeColors.white,
    },
    text: {
      primary: unifaeColors.dark,
      secondary: '#666666',
    },
    success: {
      main: unifaeColors.success,
    },
    error: {
      main: unifaeColors.error,
    },
    warning: {
      main: unifaeColors.warning,
    },
    info: {
      main: unifaeColors.info,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
    h2: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
    h3: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
    h4: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
    h5: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
    h6: {
      fontWeight: 600,
      color: unifaeColors.primary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: unifaeColors.primary,
          color: unifaeColors.white,
          '&:hover': {
            background: unifaeColors.darkPurple,
          },
        },
        outlined: {
          borderColor: unifaeColors.primary,
          color: unifaeColors.primary,
          '&:hover': {
            backgroundColor: `${unifaeColors.primary}10`,
            borderColor: unifaeColors.primary,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${unifaeColors.primary}10`,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: unifaeColors.primary,
          '&:hover': {
            background: unifaeColors.darkPurple,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: unifaeColors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: unifaeColors.primary,
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: `${unifaeColors.primary}08`,
          },
          '&.Mui-selected': {
            backgroundColor: `${unifaeColors.primary}15`,
            borderLeft: `4px solid ${unifaeColors.primary}`,
            '&:hover': {
              backgroundColor: `${unifaeColors.primary}20`,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: unifaeColors.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

export const unifaeChatTheme = {
  chatBackground: {
    background: `linear-gradient(135deg,
      ${unifaeColors.lightGray} 0%,
      ${unifaeColors.white} 50%,
      ${unifaeColors.lightGray} 100%)`,
    backgroundImage: `url('https://fae.br/novo/wp-content/uploads/2025/07/logo-unifae-220.png')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: '300px auto',
    backgroundAttachment: 'fixed',
    opacity: 0.03,
  },
  messageFromUser: {
    background: unifaeColors.primary,
    color: unifaeColors.white,
  },
  messageFromOther: {
    background: unifaeColors.white,
    color: unifaeColors.dark,
    border: `1px solid ${unifaeColors.gray}`,
  },
  sidebar: {
    background: unifaeColors.white,
    borderRight: `1px solid ${unifaeColors.gray}`,
  },
  header: {
    background: `linear-gradient(90deg, ${unifaeColors.primary}15 0%, ${unifaeColors.secondary}10 100%)`,
    borderBottom: `1px solid ${unifaeColors.gray}`,
  }
};

export default unifaeTheme;