import { createGlobalStyle } from 'styled-components';
import theme from 'theme';

/**
 * Global styles for the application
 */
export const GlobalStyle = createGlobalStyle`
    html {
        box-sizing: border-box;
    }

    *,
    *:before,
    *:after {
        box-sizing: inherit;
    }

    body {
        font-family: Helvetica, Arial, sans-serif;
        color: ${theme.colors.text.primary};
        background-color: ${theme.colors.body};
    }

    #root {
        position: relative;
        min-height: 100vh;
    }
`;