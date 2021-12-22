import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';

import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';

import { GetStaticProps } from 'next';

const Home: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Container>
      <Button onClick={() => router.push('/application')}>{t(`common:header.loginLabel`)}</Button>
      <p>Login not implemented yet, but you can use this button to go to the application page.</p>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Home;
