import React from 'react';
import { AppProps } from 'next/app';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

const YouthApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default YouthApp;
