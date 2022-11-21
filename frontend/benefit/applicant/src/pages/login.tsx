import useLogin from 'benefit/applicant/hooks/useLogin';
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
import { AxiosError } from 'axios';
import { IS_CLIENT, LOCAL_STORAGE_KEYS } from '../constants';

type NotificationProps = Pick<HDSNotificationProps, 'type' | 'label'> & {
  content?: string;
};

const Login: NextPage = () => {
  const queryClient = useQueryClient();
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

  useEffect(() => {
    if (logout) {
      void queryClient.clear();
    }
  }, [logout, queryClient]);

  useEffect(() => {
    if (IS_CLIENT)
      // eslint-disable-next-line scanjs-rules/identifier_localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED);
  }, []);

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
      <br />
      <br />
      <Button
        theme="coat"
        onClick={() => {
          throw new AxiosError(
            'there is some error message with ssn: 111111-111C should be masked',
            '400',
            {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              response: {
                status: 400,
                data: {
                  firstName: 'Jaakko',
                  lastName: 'Nenonen',
                  phoneNumber: '12345',
                },
              },
            }
          );
        }}
      >
        Log error
      </Button>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
