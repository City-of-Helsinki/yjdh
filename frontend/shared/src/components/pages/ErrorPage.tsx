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
  retry?: () => void;
  logout?: () => void;
};

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  retry,
  logout,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <$ErrorPageContainer>
        <$IconAlertCircle size="xl" />
        <$ErrorPageTitle>{title}</$ErrorPageTitle>
        <$ErrorPageMessage>{message}</$ErrorPageMessage>
        {(retry || logout) && (
          <$ActionsContainer>
            {retry && (
              <$PrimaryButton onClick={retry}>
                {t('common:errorPage.retry')}
              </$PrimaryButton>
            )}
            {logout && (
              <$PrimaryButton onClick={logout}>
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
