import * as React from 'react';
import Container from 'shared/components/container/Container';

import { $PrimaryButton } from '../applications/Applications.sc';
import {
  $ActionsContainer,
  $ErrorPageContainer,
  $ErrorPageMessage,
  $ErrorPageTitle,
  $IconAlertCircle,
} from './ErrorPage.sc';
import { useErrorPage } from './useErrorPage';

export interface ErrorPageProps {
  title: string;
  message: string;
  showActions?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  showActions = false,
}) => {
  const { t, handleBackClick } = useErrorPage();
  return (
    <Container>
      <$ErrorPageContainer>
        <$IconAlertCircle size="xl" />
        <$ErrorPageTitle>{title}</$ErrorPageTitle>
        <$ErrorPageMessage>{message}</$ErrorPageMessage>
        {showActions && (
          <$ActionsContainer>
            <$PrimaryButton onClick={handleBackClick}>
              {t('common:errorPage.back')}
            </$PrimaryButton>
            <$PrimaryButton>{t('common:errorPage.logout')}</$PrimaryButton>
          </$ActionsContainer>
        )}
      </$ErrorPageContainer>
    </Container>
  );
};

export default ErrorPage;
