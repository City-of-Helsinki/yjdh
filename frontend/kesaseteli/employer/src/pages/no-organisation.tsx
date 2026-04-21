import { Button, IconSignin } from 'hds-react';
import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import LinkText from 'shared/components/link-text/LinkText';
import { $Notification } from 'shared/components/notification/Notification.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const NoOrganisation: NextPage = () => {
  const { t } = useTranslation();
  const login = useLogin();

  return (
    <Container>
      <Head>
        <title>
          {t('common:noOrganisationPage.title')} | {t('common:appName')}
        </title>
      </Head>
      <$Notification
        label={t('common:noOrganisationPage.header')}
        type="error"
        size="large"
      >
        <p>{t('common:noOrganisationPage.content')}</p>
        <p>{t('common:noOrganisationPage.instructions')}</p>
        <p>
          <Trans
            i18nKey="common:noOrganisationPage.linkText"
            components={{
              // href should get overridden (https://react.i18next.com/latest/trans-component#overriding-react-component-props-v11.5.0),
              // but for some reason it does not. However, the setter works, when href is left as unset.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore ts(2741) link href and text will be set / overridden with values from translation.
              lnk: <LinkText />,
            }}
          />
        </p>
      </$Notification>
      <Button theme="coat" iconLeft={<IconSignin />} onClick={login}>
        {t('common:noOrganisationPage.loginButton')}
      </Button>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default NoOrganisation;
