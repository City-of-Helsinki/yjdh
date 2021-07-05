import { Button, IconPlus } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { useComponent } from './extended';
import {
  StyledActionContainer,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledNotification,
  StyledTextContainer,
} from './styled';

export interface MainIngressProps {
  errors?: Error[];
}

const MainIngress: React.FC<MainIngressProps> = ({ errors }) => {
  const { handleNewApplicationClick, handleMoreInfoClick, t } = useComponent();

  const notificationItems = errors?.map(({ message, name }, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <StyledNotification key={i} label={name} type="error">
      {message}
    </StyledNotification>
  ));

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <StyledContainer>
        <StyledHeading>{t('common:mainIngress.heading')}</StyledHeading>
        {notificationItems}
        <StyledTextContainer>
          <StyledDescription>
            {t('common:mainIngress.description1')}
            <StyledLink onClick={handleMoreInfoClick}>
              {t('common:mainIngress.linkText')}
            </StyledLink>
            {t('common:mainIngress.description2')}
          </StyledDescription>
          <StyledActionContainer>
            <Button
              iconLeft={<IconPlus />}
              onClick={handleNewApplicationClick}
              theme="coat"
            >
              {t('common:mainIngress.newApplicationBtnText')}
            </Button>
          </StyledActionContainer>
        </StyledTextContainer>
      </StyledContainer>
    </Container>
  );
};

export default MainIngress;
