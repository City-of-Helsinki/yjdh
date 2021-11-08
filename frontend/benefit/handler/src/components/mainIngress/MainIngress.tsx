import { Button, IconPlus } from 'hds-react';
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

  return (
    <Container>
      <$Container>
        <$HeadingContainer>
          <$Heading>{t('common:mainIngress.heading')}</$Heading>
        </$HeadingContainer>

        <$ActionContainer>
          <Button variant="secondary" iconLeft={<IconPlus />} theme="black">
            {t('common:mainIngress.btnText')}
          </Button>
        </$ActionContainer>
      </$Container>
    </Container>
  );
};

export default MainIngress;
