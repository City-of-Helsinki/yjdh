import getRequiredHandlerCookieGroups from 'kesaseteli/handler/utils/get-required-handler-cookie-groups';
import CookieSettings from 'kesaseteli-shared/components/cookieSettings/CookieSettings';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const CookieSettingsPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <CookieSettings
      title={`${t('common:appName')} - ${t('common:cookieSettings')}`}
      siteName={t('common:appName')}
      requiredGroups={getRequiredHandlerCookieGroups()}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default CookieSettingsPage;
