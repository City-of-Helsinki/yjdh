import { IconSignin } from 'hds-react';
import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import withoutAuth from 'shared/components/hocs/withoutAuth';
import Layout from 'shared/components/Layout';
import useClearQueryParams from 'shared/hooks/useClearQueryParams';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { $Notification, $PrimaryButton } from '../components/application/login.sc';

const Login: NextPage = () => {
  useClearQueryParams();
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();
  const login = useLogin();

  const getNotificationLabelKey = (): string => {
    let notificationLabel = `common:loginPage.infoLabel`
    if (logout) {
      notificationLabel = `common:loginPage.logoutMessageLabel`;
    } else if (error) {
      notificationLabel = `common:loginPage.errorLabel`;
    } else if (sessionExpired) {
      notificationLabel = `common:loginPage.sessionExpiredLabel`;
    }
    return notificationLabel;
  };

  const notificationLabelKey = getNotificationLabelKey();
  const notificationContent = !logout && !error && !sessionExpired && t(`common:loginPage.infoContent`)
  const notificationType = error || sessionExpired ? "error" : "info"

  return (
    <Container>
      <Layout>
        <$Notification
          label={t(notificationLabelKey)}
          type={notificationType}
          size="large"
        >
          {notificationContent}
        </$Notification>
        <$PrimaryButton
          iconLeft={<IconSignin />}
          onClick={login}
        >
          {t(`common:header.loginLabel`)}
        </$PrimaryButton>
      </Layout>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withoutAuth(Login);
