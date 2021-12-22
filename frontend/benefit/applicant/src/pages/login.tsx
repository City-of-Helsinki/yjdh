import {
  Button,
  IconSignin,
  Notification,
  NotificationProps as HDSNotificationProps,
} from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTheme } from 'styled-components';

import useLogin from '../hooks/useLogin';

type NotificationProps = Pick<HDSNotificationProps, 'type' | 'label'> & {
  content?: string;
};

const Login: NextPage = () => {
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();
  const login = useLogin();

  const theme = useTheme();

  const notificationProps = React.useMemo((): NotificationProps => {
    if (error) {
      return { type: 'error', label: t('common:login.errorLabel') };
    }
    if (sessionExpired) {
      return { type: 'error', label: t('common:login.sessionExpiredLabel') };
    }
    if (logout) {
      return { type: 'info', label: t('common:login.logoutMessageLabel') };
    }
    return {
      type: 'info',
      label: t('common:login.infoLabel'),
      content: t('common:login.infoContent'),
    };
  }, [t, error, sessionExpired, logout]);

  return (
    <Container>
      <Notification
        type={notificationProps.type}
        label={notificationProps.label}
        size="large"
        css={`
          margin-bottom: ${theme.spacing.xl};
        `}
      >
        {notificationProps.content}
      </Notification>
      <Button
        theme="coat"
        iconLeft={<IconSignin />}
        onClick={login}
        data-testid="loginButton"
      >
        {t('common:login.login')}
      </Button>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
