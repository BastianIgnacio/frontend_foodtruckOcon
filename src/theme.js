import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:   { main: '#e65100', light: '#ff833a', dark: '#ac1900' },
    secondary: { main: '#1565c0', light: '#5e92f3', dark: '#003c8f' },
    success:   { main: '#2e7d32' },
    warning:   { main: '#f57f17' },
    error:     { main: '#c62828' },
    background:{ default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 } }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12 } }
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 12 } }
    }
  }
})

export default theme
