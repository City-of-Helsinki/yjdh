'use client';

import CookieSettings from 'kesaseteli-shared/components/cookieSettings/CookieSettings';
import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';

const CookieSettingsPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <CookieSettings
      title={`${t('common:appName')} - ${t('common:cookieSettings')}`}
      siteName={t('common:appName')}
    />
  );
};

export default CookieSettingsPage;
