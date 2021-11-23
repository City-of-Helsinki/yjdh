import { Button, IconSignin } from 'hds-react';
import { $Notification } from 'kesaseteli/employer/components/application/login.sc';
import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import useClearQueryParams from 'shared/hooks/useClearQueryParams';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const Login: NextPage = () => {
  useClearQueryParams();
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();
  const login = useLogin();

  const notificationLabelKey = React.useMemo((): string => {
    if (logout) {
      return `common:loginPage.logoutMessageLabel`;
    }
    if (error) {
      return `common:loginPage.errorLabel`;
    }
    if (sessionExpired) {
      return `common:loginPage.sessionExpiredLabel`;
    }
    return `common:loginPage.infoLabel`;
  }, [logout, error, sessionExpired]);

  const notificationContent = React.useMemo((): string | null => {
    if (error || logout) {
      return null;
    }
    if (sessionExpired) {
      return t(`common:loginPage.logoutInfoContent`);
    }
    return t(`common:loginPage.infoContent`);
  }, [logout, error, sessionExpired, t]);

  const notificationType = error || sessionExpired ? 'error' : 'info';

  return (
    <Container>
      <Head>
        <title>
          {t(notificationLabelKey)} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification
        label={t(notificationLabelKey)}
        type={notificationType}
        size="large"
      >
        {notificationContent}
      </$Notification>
      <Button theme="coat" iconLeft={<IconSignin />} onClick={login}>
        {t(`common:header.loginLabel`)}
      </Button>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
