import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import CookieConsent from '../components/cookieConsent/CookieConsent';

const CookieSettings: NextPage = () => (
  <Container>
    <CookieConsent asPage />
  </Container>
);

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default CookieSettings;
