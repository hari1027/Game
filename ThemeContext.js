// ThemeContext.js

import React, { createContext, useContext, useState } from 'react';
import { darkTheme } from './styles';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {

    const theme = darkTheme;

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
