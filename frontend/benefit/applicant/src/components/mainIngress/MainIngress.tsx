import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import { Button, IconPlus } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import {
  $ActionContainer,
  $Container,
  $Description,
  $Heading,
  $Link,
  $TextContainer,
} from './MainIngress.sc';
import { useMainIngress } from './useMainIngress';

const MainIngress: React.FC = () => {
  const {
    errors,
    application,
    handleNewApplicationClick,
    handleMoreInfoClick,
    t,
    handleCloseNotification,
  } = useMainIngress();

  const successNotification = application ? (
    <$Notification
      label={t('common:notifications.applicationSubmitted.label')}
      type="success"
      dismissible
      closeButtonLabelText={t('common:utility.close')}
      onClose={handleCloseNotification}
    >
      {t('common:notifications.applicationSubmitted.message', {
        applicationNumber: application?.applicationNumber,
        applicantName: application?.applicantName,
      })}
    </$Notification>
  ) : null;

  const notificationItems = errors?.map(({ message, name }, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <$Notification key={`${i}`} label={name} type="error">
      {message}
    </$Notification>
  ));

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <$Container>
        <$Heading>{t('common:mainIngress.heading')}</$Heading>
        {successNotification}
        {notificationItems}
        <$TextContainer>
          <$Description>
            {t('common:mainIngress.description1')}
            <$Link onClick={handleMoreInfoClick}>
              {t('common:mainIngress.linkText')}
            </$Link>
            {t('common:mainIngress.description2')}
          </$Description>
          <$ActionContainer>
            <Button
              iconLeft={<IconPlus />}
              onClick={handleNewApplicationClick}
              theme="coat"
            >
              {t('common:mainIngress.newApplicationBtnText')}
            </Button>
          </$ActionContainer>
        </$TextContainer>
      </$Container>
    </Container>
  );
};

export default MainIngress;
