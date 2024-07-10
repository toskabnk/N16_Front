import { Provider } from "react-redux";
import { store } from "../redux/store";
import theme from "../theme/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledProvider } from "styled-components";

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
                    {children}
                </Provider>
            </ThemeProvider>
        </StyledProvider>
    )
}

export default Providers;