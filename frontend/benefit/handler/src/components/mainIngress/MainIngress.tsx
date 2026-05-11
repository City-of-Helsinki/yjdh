import { ROUTES } from 'benefit/handler/constants';
import { Button, ButtonPresetTheme, ButtonVariant, IconPlus } from 'hds-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import {
  $ActionContainer,
  $Container,
  $Heading,
  $HeadingContainer,
} from './MainIngress.sc';
import { useMainIngress } from './useMainIngress';

const MainIngress: React.FC = () => {
  const { t } = useMainIngress();
  const router = useRouter();

  return (
    <Container>
      <$Container>
        <$HeadingContainer data-testid="main-ingress">
          <$Heading>{t('common:mainIngress.heading')}</$Heading>
        </$HeadingContainer>

        <$ActionContainer>
          <Button
            onClick={() => router.push(ROUTES.APPLICATION_FORM_NEW)}
            variant={ButtonVariant.Secondary}
            iconStart={<IconPlus />}
            theme={ButtonPresetTheme.Black}
            data-testid="new-application-button"
          >
            {t('common:mainIngress.btnText')}
          </Button>
        </$ActionContainer>
      </$Container>
    </Container>
  );
};

export default MainIngress;
