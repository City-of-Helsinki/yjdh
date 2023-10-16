import {
  $Hr,
  $Paragraph,
  $Subheading,
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
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { removeLocalStorageItem } from 'shared/utils/localstorage.utils';

import { $LoginGrid } from '../components/pages/Login.sc';
import { LOCAL_STORAGE_KEYS } from '../constants';

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
    removeLocalStorageItem(LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED);
    removeLocalStorageItem(LOCAL_STORAGE_KEYS.CSRF_TOKEN);
  }, []);

  return (
    <Container>
      <$LoginGrid>
        <$GridCell $colSpan={12}>
          {notificationProps && (
            <Notification
              type={notificationProps.type}
              label={notificationProps.label}
              size="large"
            >
              {notificationProps.content}
            </Notification>
          )}
          <Heading as="h1" size="xl" header={t('common:login.heading')} />
          <$Paragraph>{t('common:login.infoText1')}</$Paragraph>
          <$Hr />
          <$Subheading>{t('common:login.subheading1')}</$Subheading>
          <$Paragraph>{t('common:login.infoText2')}</$Paragraph>
          <$Grid columns={16}>
            <$GridCell $colSpan={14}>
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
          <$Subheading>{t('common:login.subheading2')}</$Subheading>
          <$Paragraph>{t('common:login.infoText3')}</$Paragraph>
          <$Grid columns={16}>
            <$GridCell $colSpan={14}>
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
      </$LoginGrid>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default Login;
