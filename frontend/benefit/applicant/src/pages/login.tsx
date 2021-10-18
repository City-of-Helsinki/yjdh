import { Button, IconSignin, Notification } from 'hds-react';
import noop from 'lodash/noop';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import Layout from 'shared/components/Layout';
import useClearQueryParams from 'shared/hooks/useClearQueryParams';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTheme } from 'styled-components';

const Login: NextPage = () => {
  useClearQueryParams();
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();

  const theme = useTheme();

  const getNotificationLabelKey = (): string => {
    if (logout) {
      return `common:login.logoutMessageLabel`;
    }
    if (error) {
      return `common:login.errorLabel`;
    }
    if (sessionExpired) {
      return `common:login.sessionExpiredLabel`;
    }
    return `common:login.infoLabel`;
  };

  const notificationLabelKey = getNotificationLabelKey();
  const notificationContent =
    !logout && !error && !sessionExpired && t(`common:login.infoContent`);
  const notificationType = error || sessionExpired ? 'error' : 'info';

  return (
    <Container>
      <Layout>
        <Notification
          label={t(notificationLabelKey)}
          type={notificationType}
          size="large"
          css={`
            margin-bottom: ${theme.spacing.xl};
          `}
        >
          {notificationContent}
        </Notification>
        <Button theme="coat" iconLeft={<IconSignin />} onClick={noop}>
          {t(`common:login.login`)}
        </Button>
      </Layout>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

// TODO: redirect when the user is authenticated: withoutAuth(Login)
export default Login;
