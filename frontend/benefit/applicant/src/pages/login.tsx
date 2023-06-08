import {
  $H1,
  $H2,
  $Hr,
  $P,
} from 'benefit/applicant/components/pages/Pages.sc';
import useLogin from 'benefit/applicant/hooks/useLogin';
import {
  Button,
  IconLinkExternal,
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
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { IS_CLIENT, LOCAL_STORAGE_KEYS } from '../constants';

type NotificationProps =
  | (Pick<HDSNotificationProps, 'type' | 'label'> & {
      content?: string;
    })
  | null;

const Login: NextPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();
  const login = useLogin();

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
    return null;
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
      <$Grid>
        <$GridCell $colSpan={6}>
          {notificationProps && (
            <Notification
              type={notificationProps.type}
              label={notificationProps.label}
              size="large"
            >
              {notificationProps.content}
            </Notification>
          )}
          <$H1>{t('common:login.header')}</$H1>
          <$P>{t('common:login.infoText1')}</$P>
          <$Hr />
          <$H2>{t('common:login.smallHeader1')}</$H2>
          <$P>{t('common:login.infoText2')}</$P>
          <$Grid>
            <$GridCell $colSpan={8}>
              <Button
                theme="coat"
                fullWidth
                iconRight={<IconSignin />}
                onClick={login}
                data-testid="loginButton"
              >
                {t('common:login.login')}
              </Button>
            </$GridCell>
          </$Grid>
          <$Hr />
          <$H2>{t('common:login.smallHeader2')}</$H2>
          <$P>{t('common:login.infoText3')}</$P>
          <$Grid>
            <$GridCell $colSpan={8}>
              <Button
                theme="coat"
                variant="secondary"
                fullWidth
                iconRight={<IconLinkExternal />}
                onClick={() =>
                  // eslint-disable-next-line security/detect-non-literal-fs-filename
                  window.open(t('common:login.suomifiUrl'), '_blank')
                }
              >
                {t('common:login.authorization')}
              </Button>
            </$GridCell>
          </$Grid>
          <$Hr />
          <Notification
            type="info"
            label={t('common:login.infoLabel')}
            size="default"
          >
            {t('common:login.infoContent')}
          </Notification>
        </$GridCell>
      </$Grid>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
