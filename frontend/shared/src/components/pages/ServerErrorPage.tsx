import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import ErrorPage from 'shared/components/pages/ErrorPage';
import useLocale from 'shared/hooks/useLocale';

export type Props = {
  logout?: () => void;
};

const ServerErrorPage: React.FC<Props> = ({ logout }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const redirect = React.useCallback((): void => {
    void router.push(`/${locale}/`);
  }, [router, locale]);
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
        retry={redirect}
        logout={logout}
      />
    </Container>
  );
};

export default ServerErrorPage;
