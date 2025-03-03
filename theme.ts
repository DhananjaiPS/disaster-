import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#f44336', // Red for emergency/alert context
      light: '#ff7961',
      dark: '#ba000d',
    },
    secondary: {
      main: '#2196f3', // Blue for information/tracking
      light: '#6ec6ff',
      dark: '#0069c0',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ffa000',
    },
    success: {
      main: '#43a047',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
}); 