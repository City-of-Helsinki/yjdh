'use client';

import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const ActivatedPage: NextPage = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="success"
      title={t(`common:notificationPages.activated.title`)}
      message={t(`common:notificationPages.activated.message`)}
    />
  );
};

export default ActivatedPage;
