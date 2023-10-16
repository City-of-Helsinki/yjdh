import { ROUTES } from 'benefit/applicant/constants';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import {
  $ActionsContainer,
  $IconCheck,
  $Notification,
  $NotificationMessage,
  $NotificationRow,
  $NotificationTitle,
} from './NotificatinsView.sc';

type Props = {
  title: string;
  message: string;
};

const NotificationView: React.FC<Props> = ({ title, message }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoHome = (): void => {
    void router.push(ROUTES.HOME);
  };

  const handleReload = (): void => {
    void router.reload();
  };

  return (
    <Container>
      <$Notification>
        <$NotificationRow>
          <$IconCheck size="xl" />
        </$NotificationRow>
        <$NotificationRow>
          <$NotificationTitle>{title}</$NotificationTitle>
          <$NotificationMessage>{message}</$NotificationMessage>
          <$ActionsContainer>
            <Button theme="coat" onClick={handleGoHome}>
              {t('common:utility.home')}
            </Button>
            <Button theme="coat" variant="secondary" onClick={handleReload}>
              {t('common:applications.actions.viewSavedApplication')}
            </Button>
          </$ActionsContainer>
        </$NotificationRow>
      </$Notification>
    </Container>
  );
};

export default NotificationView;
