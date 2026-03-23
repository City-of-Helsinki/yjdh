'use client';

import CookieSettings from 'kesaseteli-shared/components/cookieSettings/CookieSettings';
import { NextPage } from 'next';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
