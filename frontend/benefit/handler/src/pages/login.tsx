import useLogin from 'benefit/handler/hooks/useLogin';
import {
  Button,
  IconSignin,
  Notification,
  NotificationProps as HDSNotificationProps,
} from 'hds-react';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTheme } from 'styled-components';

type NotificationProps = Pick<HDSNotificationProps, 'type' | 'label'> & {
  content?: string;
};

const Login: NextPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();
  const login = useLogin();
  const theme = useTheme();

  const notificationProps = React.useMemo((): NotificationProps => {
    if (router.query.error) {
      return { type: 'error', label: t('common:login.errorLabel') };
    }
    if (router.query.sessionExpired) {
      return { type: 'error', label: t('common:login.sessionExpiredLabel') };
    }
    if (router.query.logout) {
      return { type: 'info', label: t('common:login.logoutMessageLabel') };
    }
    return {
      type: 'info',
      label: t('common:login.infoLabel'),
      content: t('common:login.infoContent'),
    };
  }, [t, router.query.error, router.query.sessionExpired, router.query.logout]);

  useEffect(() => {
    if (router.query.logout) {
      void queryClient.clear();
    }
  }, [router.query.logout, queryClient]);

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
      <Button theme="coat" iconLeft={<IconSignin />} onClick={login}>
        {t('common:login.login')}
      </Button>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
