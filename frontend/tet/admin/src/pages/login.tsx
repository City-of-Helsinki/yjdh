import { Button, IconSignin } from 'hds-react';
import useLogin from 'tet/admin/hooks/backend/useLogin';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import { $Notification } from 'shared/components/notification/Notification.sc';
import useClearQueryParams from 'shared/hooks/useClearQueryParams';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { $InfoboxContent } from 'tet/admin/components/login/InfoboxContent.sc';
import LoginLinks from 'tet/admin/components/login/LoginLinks';
import LoginHeader from 'tet/admin/components/login/LoginHeader';

const Login: NextPage = () => {
  const queryClient = useQueryClient();
  useClearQueryParams();
  const { t } = useTranslation();
  const {
    query: { logout, error, sessionExpired },
  } = useRouter();

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

  const notificationContent = React.useMemo((): JSX.Element | null => {
    if (error || logout) {
      return null;
    }
    if (sessionExpired) {
      return t(`common:loginPage.logoutInfoContent`);
    }
    return (
      <$InfoboxContent>
        {t(`common:loginPage.infoContent.listHeading`)}
        <br />- {t(`common:loginPage.infoContent.bullet1`)}
        <br />- {t(`common:loginPage.infoContent.bullet2`)}
        <br />- {t(`common:loginPage.infoContent.bullet3`)}
        <br />
        <br />
        <Trans
          i18nKey="common:loginPage.infoContent.moreInfo"
          components={{
            a: (
              <a href={t('common:footer.privacyPolicyLink')} rel="noopener noreferrer" target="_blank">
                {}
              </a>
            ),
          }}
        >
          {
            'Lisätietoja henkilötietojen käsittelystä (mm. oikeusperusteet ja säilytysajat) TET-paikkojen ilmoituspalvelussa löydät <a>opintohallintorekisteristä</a>'
          }
        </Trans>
        <br />
        <br />
        {t(`common:loginPage.infoContent.registerRights1`)}
        <br />
        <Trans
          i18nKey="common:loginPage.infoContent.registerRights2"
          components={{
            a: (
              <a href={t('common:footer.privacyPolicyLink')} rel="noopener noreferrer" target="_blank">
                {}
              </a>
            ),
          }}
        >
          {
            'Rekisteröity voi muun muassa tarkistaa mitä tietoja hänestä on kerätty. Lisätietoja oikeuksista ja niiden toteuttamisesta <a>Helsingin kaupungin tietosuojasivulla</a>.'
          }
        </Trans>
      </$InfoboxContent>
    );
  }, [logout, error, sessionExpired, t]);

  const notificationType = error || sessionExpired ? 'error' : 'info';

  useEffect(() => {
    if (logout) {
      void queryClient.removeQueries();
    }
  }, [logout, queryClient]);

  return (
    <>
      <Head>
        <title>
          {t(notificationLabelKey)} | {t(`common:appName`)}
        </title>
      </Head>
      <LoginHeader />
      <Container>
        <LoginLinks />
        <$Notification label={t(notificationLabelKey)} type={notificationType} size="large">
          {notificationContent}
        </$Notification>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Login;
