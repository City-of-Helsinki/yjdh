import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

import {
  $ActionsContainer,
  $IconAlertCircle,
  $IconCheckCircle,
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

  const handleStartAhjo = (): void => {
    const activeTab =
      handledApplication?.status === APPLICATION_STATUSES.ACCEPTED ? 4 : 5;
    void router.push({ pathname: ROUTES.HOME, query: { tab: activeTab } });
  };

  return (
    <Container>
      <$Notification>
        <$Grid>
          <$GridCell $colSpan={2}>
            {handledApplication?.status ? (
              <$IconCheckCircle size="xl" />
            ) : (
              <$IconAlertCircle size="xl" />
            )}
          </$GridCell>
          <$GridCell $colSpan={10}>
            <$NotificationTitle>
              {t(
                `${translationsBase}.${String(
                  handledApplication?.status ?? 'error'
                )}.title`
              )}
            </$NotificationTitle>
            <$NotificationMessage>
              {t(
                `${translationsBase}.${String(
                  handledApplication?.status ?? 'error'
                )}.message`,
                { applicationNum: data?.applicationNumber }
              )}
            </$NotificationMessage>
          </$GridCell>
          <$GridCell $colSpan={10} $colStart={3}>
            <$NotificationMessage>
              {t(`${translationsBase}.ahjoMessage.message`)}
            </$NotificationMessage>
          </$GridCell>
          <$GridCell $colSpan={10} $colStart={3}>
            {handledApplication && (
              <$ActionsContainer>
                <Button theme="coat" onClick={handleGoHome}>
                  {t('common:utility.home')}
                </Button>
                <Button
                  variant="secondary"
                  theme="coat"
                  onClick={handleStartAhjo}
                >
                  {t(`${translationsBase}.ahjoButton.label`)}
                </Button>
              </$ActionsContainer>
            )}
          </$GridCell>
        </$Grid>
      </$Notification>
    </Container>
  );
};

export default NotificationView;
