import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { Application } from 'benefit/handler/types/application';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';

import {
  $ActionsContainer,
  $IconAlertCircle,
  $IconCheck,
  $Notification,
  $NotificationMessage,
  $NotificationTitle,
} from './NotificatinsView.sc';

type Props = {
  data?: Application;
};

const NotificationView: React.FC<Props> = ({ data }) => {
  const translationsBase = 'common:notifications';
  const { t } = useTranslation();
  const router = useRouter();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  useEffect(() => () => setHandledApplication(null), [setHandledApplication]);

  const handleGoHome = (): void => {
    void router.push(ROUTES.HOME);
  };

  return (
    <Container>
      <$Notification>
        {handledApplication?.status ? (
          <$IconCheck size="xl" />
        ) : (
          <$IconAlertCircle size="xl" />
        )}
        <$NotificationTitle>
          {t(
            `${translationsBase}.${handledApplication?.status ?? 'error'}.title`
          )}
        </$NotificationTitle>
        <$NotificationMessage>
          {t(
            `${translationsBase}.${
              handledApplication?.status ?? 'error'
            }.message`,
            { applicationNum: data?.applicationNumber }
          )}
        </$NotificationMessage>
        {handledApplication && (
          <$ActionsContainer>
            <Button theme="coat" onClick={handleGoHome}>
              {t('common:utility.home')}
            </Button>
          </$ActionsContainer>
        )}
      </$Notification>
    </Container>
  );
};

NotificationView.defaultProps = {
  data: {},
};

export default NotificationView;
