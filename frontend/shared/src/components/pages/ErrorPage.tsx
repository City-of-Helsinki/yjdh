import { ButtonPresetTheme, IconSize } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Button from 'shared/components/button/Button';
import Container from 'shared/components/container/Container';

import {
  $ActionsContainer,
  $ErrorPageContainer,
  $ErrorPageMessage,
  $ErrorPageTitle,
  $IconAlertCircle,
} from './ErrorPage.sc';

export type ErrorPageProps = {
  errorId?: string;
  title: string;
  message: string;
  retry?: () => void;
  logout?: () => void;
};

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorId,
  title,
  message,
  retry,
  logout,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <$ErrorPageContainer>
        <$IconAlertCircle size={IconSize.ExtraLarge} />
        <$ErrorPageTitle>{title}</$ErrorPageTitle>
        <$ErrorPageMessage>{message}</$ErrorPageMessage>
        {errorId && <$ErrorPageMessage>({errorId})</$ErrorPageMessage>}
        {(retry || logout) && (
          <$ActionsContainer>
            {retry && (
              <Button theme={ButtonPresetTheme.Coat} onClick={retry}>
                {t('common:errorPage.retry')}
              </Button>
            )}
            {logout && (
              <Button theme={ButtonPresetTheme.Coat} onClick={logout}>
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
