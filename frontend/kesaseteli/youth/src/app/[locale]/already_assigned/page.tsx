'use client';

import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const AlreadyAssignedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.alreadyAssigned.title`)}
      goToFrontPageText={t(
        `common:notificationPages.alreadyAssigned.goToFrontendPage`
      )}
    />
  );
};

export default AlreadyAssignedPage;
