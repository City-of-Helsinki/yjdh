import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import * as React from 'react';
import { PropsWithChildren, ReactNode } from 'react';
import Container from 'shared/components/container/Container';

import {
  $Container,
  $Description,
  $Heading,
  $Koros,
  $KorosContainer,
  $TextContainer,
} from './MainIngress.sc';
import { useMainIngress } from './useMainIngress';

type Props = {
  heading: string;
  description?: ReactNode;
};

const MainIngress: React.FC<PropsWithChildren<Props>> = ({
  heading,
  description,
  children,
}) => {
  const { errors } = useMainIngress();

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
          <$Heading>{heading}</$Heading>
          {notificationItems}
          <$TextContainer>
            <$Description>{description}</$Description>
            {children}
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
