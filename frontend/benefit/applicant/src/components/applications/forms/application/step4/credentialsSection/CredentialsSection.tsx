import * as React from 'react';

import {
  $ActionsContainer,
  $Container,
  $Description,
  $Heading,
  $IconContainer,
} from './CredentialsSection.sc';

export interface CredentialsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: React.ReactNode;
}

const CredentialsSection: React.FC<CredentialsSectionProps> = ({
  title,
  description,
  icon,
  actions,
}) => (
  <$Container>
    <$Heading>{title}</$Heading>
    <$IconContainer>{icon}</$IconContainer>
    <$Description>{description}</$Description>
    <$ActionsContainer>{actions}</$ActionsContainer>
  </$Container>
);

export default CredentialsSection;
