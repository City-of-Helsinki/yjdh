import theme from './theme';

export const Main = `
  html {
    height: 100%;
    width: 100%;
  }

  body {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  // Override globally all text to use Helsinki font.
  * {
    font-family: ${theme.fonts.helGrotesk}
  }
`;
