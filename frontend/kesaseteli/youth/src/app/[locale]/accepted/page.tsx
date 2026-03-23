'use client';

import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const AcceptedPage: NextPage = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="success"
      title={t(`common:notificationPages.accepted.title`)}
      message={t(`common:notificationPages.accepted.message`)}
    />
  );
};

export default AcceptedPage;
