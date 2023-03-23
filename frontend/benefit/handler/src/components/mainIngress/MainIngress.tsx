import { Button, IconPlus } from 'hds-react';
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
            onClick={() => router.push('/new-application')}
            variant="secondary"
            iconLeft={<IconPlus />}
            theme="black"
          >
            {t('common:mainIngress.btnText')}
          </Button>
        </$ActionContainer>
      </$Container>
    </Container>
  );
};

export default MainIngress;
