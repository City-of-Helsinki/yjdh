import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import {
  $ActionsContainer,
  $ErrorPageContainer,
  $ErrorPageMessage,
  $ErrorPageTitle,
  $IconAlertCircle,
  $PrimaryButton,
} from './ErrorPage.sc';

export type ErrorPageProps = {
  title: string;
  message: string;
  onGoBack?: () => void;
  onLogout?: () => void;
};

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  onGoBack,
  onLogout,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <$ErrorPageContainer>
        <$IconAlertCircle size="xl" />
        <$ErrorPageTitle>{title}</$ErrorPageTitle>
        <$ErrorPageMessage>{message}</$ErrorPageMessage>
        {(onGoBack || onLogout) && (
          <$ActionsContainer>
            {onGoBack && (
              <$PrimaryButton onClick={onGoBack}>
                {t('common:errorPage.home')}
              </$PrimaryButton>
            )}
            {onLogout && (
              <$PrimaryButton onClick={onLogout}>
                {t('common:errorPage.logout')}
              </$PrimaryButton>
            )}
          </$ActionsContainer>
        )}
      </$ErrorPageContainer>
    </Container>
  );
};

export default ErrorPage;
