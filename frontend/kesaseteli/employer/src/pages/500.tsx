import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
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
    <ErrorPage
      title={t('common:errorPage.title')}
      message={t('common:errorPage.message')}
      logout={logout as () => void}
      retry={redirect}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ServerErrorPage);
