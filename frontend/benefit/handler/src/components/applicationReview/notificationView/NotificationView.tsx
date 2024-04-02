import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Button, IconLinkExternal } from 'hds-react';
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
  const { setHandledApplication } = React.useContext(AppContext);

  useEffect(() => () => setHandledApplication(null), [setHandledApplication]);

  const handleGoHome = (): void => {
    void router.push(ROUTES.HOME);
  };
  const handleStartAhjo = (): void => {
    const activeTab = data?.status === APPLICATION_STATUSES.ACCEPTED ? 4 : 5;
    void router.push({ pathname: ROUTES.HOME, query: { tab: activeTab } });
  };

  const isNewAhjoMode = useDetermineAhjoMode();
  const translationKey = data?.status ?? 'error';

  return (
    <Container>
      <$Notification>
        <$Grid>
          <$GridCell $colSpan={2}>
            {translationKey !== 'error' ? (
              <$IconCheckCircle size="xl" />
            ) : (
              <$IconAlertCircle size="xl" />
            )}
          </$GridCell>
          <$GridCell $colSpan={10}>
            <$NotificationTitle>
              {isNewAhjoMode
                ? t(`common:review.decisionProposal.submitted.title`)
                : t(`${translationsBase}.${translationKey}.title`)}
            </$NotificationTitle>
            <$NotificationMessage>
              {isNewAhjoMode
                ? t(`common:review.decisionProposal.submitted.text`)
                : t(`${translationsBase}.${translationKey}.message`, {
                    applicationNum: data?.applicationNumber,
                  })}
            </$NotificationMessage>
          </$GridCell>
          {isNewAhjoMode && (
            <$GridCell $colSpan={10} $colStart={3}>
              <$ActionsContainer>
                <Button theme="coat" onClick={handleGoHome}>
                  {t('common:utility.home')}
                </Button>
                <Button
                  variant="secondary"
                  theme="coat"
                  onClick={handleStartAhjo}
                  iconRight={<IconLinkExternal />}
                >
                  {t(`${translationsBase}.ahjoButton.linkLabel`)}
                </Button>
              </$ActionsContainer>
            </$GridCell>
          )}
          {!isNewAhjoMode && (
            <>
              <$GridCell $colSpan={10} $colStart={3}>
                <$NotificationMessage>
                  {t(`${translationsBase}.ahjoMessage.message`)}
                </$NotificationMessage>
              </$GridCell>
              {[
                APPLICATION_STATUSES.ACCEPTED,
                APPLICATION_STATUSES.REJECTED,
              ].includes(data?.status) && (
                <$GridCell $colSpan={10} $colStart={3}>
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
                </$GridCell>
              )}
            </>
          )}
        </$Grid>
      </$Notification>
    </Container>
  );
};

export default NotificationView;
