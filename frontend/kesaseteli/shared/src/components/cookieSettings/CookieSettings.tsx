import dynamic from 'next/dynamic';
import Head from 'next/head';
import * as React from 'react';
import Container from 'shared/components/container/Container';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

export type CookieSettingsProps = {
  title: string;
  siteName: string;
};

const CookieSettings: React.FC<CookieSettingsProps> = (
  props: CookieSettingsProps
) => {
  const { title, siteName } = props;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Container>
        <CookieConsent asPage siteName={siteName} />
      </Container>
    </>
  );
};

export default CookieSettings;
