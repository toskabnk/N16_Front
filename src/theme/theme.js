import { createTheme } from '@mui/material/styles';

// Crear tema de la aplicacion
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#83DCF0',
    },
    secondary: {
      main: '#CEF2FF',
    },
    background: {
      default: '#dff2ff',
      paper: '#e5f3f8',
    },
  },
});

export default theme;