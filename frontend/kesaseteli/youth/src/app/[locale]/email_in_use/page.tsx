'use client';

import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';

const EmailInUsePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.emailInUse.title`)}
      message={t(`common:notificationPages.emailInUse.message`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
      goToFrontPageText={t(
        `common:notificationPages.emailInUse.goToFrontendPage`
      )}
    />
  );
};

export default EmailInUsePage;
