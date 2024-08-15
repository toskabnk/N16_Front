import React, { createContext, useContext } from 'react';
import { useSnackbar, SnackbarProvider } from 'notistack';

const SnackbarContext = createContext();

export const useSnackbarContext = () => {
    return useContext(SnackbarContext);
};

export const SnackbarWrapperProvider = ({ children }) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showSnackbar = (message, options = {}) => {
        enqueueSnackbar(message, options);
    };

    const closeSnackbarGlobal = (key) => {
        closeSnackbar(key);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar, closeSnackbarGlobal }}>
            {children}
        </SnackbarContext.Provider>
    );
};