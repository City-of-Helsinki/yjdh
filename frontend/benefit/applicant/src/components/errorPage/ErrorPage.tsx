import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';

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
  showActions?: {
    linkToRoot: boolean;
    linkToLogout: boolean;
  };
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  showActions,
}) => {
  const { t, handleBackClick, handleLogout } = useErrorPage();
  return (
    <Container>
      <$ErrorPageContainer>
        <$IconAlertCircle size="xl" />
        <$ErrorPageTitle>{title}</$ErrorPageTitle>
        <$ErrorPageMessage>{message}</$ErrorPageMessage>
        {!!showActions && (
          <$ActionsContainer>
            {showActions?.linkToRoot && (
              <Button theme="coat" onClick={handleBackClick}>
                {t('common:errorPage.home')}
              </Button>
            )}
            {showActions?.linkToLogout && (
              <Button theme="coat" onClick={handleLogout}>
                {t('common:errorPage.logout')}
              </Button>
            )}
          </$ActionsContainer>
        )}
      </$ErrorPageContainer>
    </Container>
  );
};

export default ErrorPage;
