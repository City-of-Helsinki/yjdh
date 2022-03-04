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

  return (
    <Container>
      <$Notification>
        <$IconCheck size="xl" />
        <$NotificationTitle>{title}</$NotificationTitle>
        <$NotificationMessage>{message}</$NotificationMessage>
        <$ActionsContainer>
          <Button theme="coat" onClick={handleGoHome}>
            {t('common:utility.home')}
          </Button>
        </$ActionsContainer>
      </$Notification>
    </Container>
  );
};

export default NotificationView;
