import { Provider } from "react-redux";
import { store } from "../redux/store";
import theme from "../theme/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledProvider } from "styled-components";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb';

/**
 * Provee el store y el tema a la aplicacion
 * @param {*} children Componentes hijos
 * @returns {JSX.Element} Proveedores de la aplicacion
 */
const Providers = ({ children }) => {
    return (
        <StyledProvider theme={theme}>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                        {children}
                    </LocalizationProvider>
                </Provider>
            </ThemeProvider>
        </StyledProvider>
    )
}

export default Providers;