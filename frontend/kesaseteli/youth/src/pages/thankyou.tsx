import { Button, IconArrowRight } from 'hds-react';
import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import useGoToFrontPage from 'shared/hooks/useGoToFrontPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Head>
        <title>
          {t(`common:thankyouPage.title`)} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification
        label={t(`common:thankyouPage.notificationTitle`)}
        type="success"
        size="large"
      >
        {t(`common:thankyouPage.notificationMessage`, {
          expirationHours: useActivationLinkExpirationHours(),
        })}
      </$Notification>
      <FormSection columns={1} withoutDivider>
        <$GridCell>
          <Button
            theme="coat"
            iconRight={<IconArrowRight />}
            onClick={useGoToFrontPage()}
          >
            {t(`common:thankyouPage.goToFrontendPage`)}
          </Button>
        </$GridCell>
      </FormSection>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default ThankYouPage;
