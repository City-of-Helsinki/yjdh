import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import { Button, IconPlus } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import {
  $ActionContainer,
  $Container,
  $Description,
  $Heading,
  $Koros,
  $KorosContainer,
  $TextContainer,
} from './MainIngress.sc';
import { useMainIngress } from './useMainIngress';

const MainIngress: React.FC = () => {
  const { errors, handleNewApplicationClick, t } = useMainIngress();

  const notificationItems = errors?.map(({ message, name }, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <$Notification key={`${i}`} label={name} type="error">
      {message}
    </$Notification>
  ));

  return (
    <div data-testid="main-ingress">
      <$Container>
        <Container>
          <$Heading>{t('common:mainIngress.heading')}</$Heading>
          {notificationItems}
          <$TextContainer>
            <$Description>
              {t('common:mainIngress.description1')}
              {/* TODO: uncomment once having link to redirect to more info url,
            handleMoreInfoClick is from useMainIngress */}
              {/* <$Link onClick={handleMoreInfoClick}>
              {t('common:mainIngress.linkText')}
            </$Link> */}
              {t('common:mainIngress.description2')}
            </$Description>
            <$ActionContainer>
              <Button
                data-testid="newApplicationButton"
                iconLeft={<IconPlus />}
                onClick={handleNewApplicationClick}
                theme="coat"
              >
                {t('common:mainIngress.newApplicationBtnText')}
              </Button>
            </$ActionContainer>
          </$TextContainer>
        </Container>
      </$Container>
      <$KorosContainer>
        <$Koros type="basic" rotate="180deg" />
      </$KorosContainer>
    </div>
  );
};

export default MainIngress;
