'use client';

import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const AlreadyActivatedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.alreadyActivated.title`)}
    />
  );
};

export default AlreadyActivatedPage;
