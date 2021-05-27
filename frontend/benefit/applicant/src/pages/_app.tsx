import { AppProps } from 'next/app';
import React from 'react';

import { appWithTranslation } from '../../i18n';

import { ThemeProvider } from 'styled-components';

import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';

import Layout from 'shared/components/layout/Layout';
import Content from 'shared/components/content/Content';

import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';

const App = ({ Component, pageProps }: AppProps) => (
  <React.Fragment>
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
  </React.Fragment>
);

export default appWithTranslation(App);
