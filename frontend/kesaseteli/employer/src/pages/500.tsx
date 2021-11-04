import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import ErrorPage from 'shared/components/pages/ErrorPage';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ServerErrorPage: NextPage = () => {
  const { t } = useTranslation();
  const { mutate: logout } = useLogoutQuery();
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
        logout={logout as () => void}
        retry={redirect}
      />
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ServerErrorPage);
