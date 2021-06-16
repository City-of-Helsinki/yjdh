import Footer from 'benefit/applicant/components/footer/Footer';
import Header from 'benefit/applicant/components/header/Header';
import { appWithTranslation } from 'benefit/applicant/i18n';
import { AppProps } from 'next/app';
import React from 'react';
import Content from 'shared/components/content/Content';
import Layout from 'shared/components/layout/Layout';
import GlobalStyling from 'shared/styles/globalStyling';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

const App: React.FC<AppProps> = ({ Component, pageProps }) => (
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
