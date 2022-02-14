import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import ErrorPage from 'shared/components/pages/ErrorPage';
import useGoToPage from 'shared/hooks/useGoToPage';

export type Props = {
  logout?: () => void;
};

const ServerErrorPage: React.FC<Props> = ({ logout }) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>
          {t('common:errorPage.title')} | {t(`common:appName`)}
        </title>
      </Head>
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        retry={useGoToPage()}
        logout={logout}
      />
    </Container>
  );
};

export default ServerErrorPage;
