import { AppProps } from 'next/app';
import React from 'react';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import { appWithTranslation } from '../../i18n';
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <ThemeProvider theme={theme}>
      <GlobalStyling />
      <Layout>
        <Header />
        <Content>
          <Component {...pageProps} />
        </Content>
        <Footer />
      </Layout>
    </ThemeProvider>
  </>
);

export default appWithTranslation(App);
