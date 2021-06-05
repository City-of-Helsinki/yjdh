import { IconPlus } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { useComponent } from './extended';
import {
  StyledActionContainer,
  StyledButton,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledTextContainer,
} from './styled';

const ApplicationFormStep1: React.FC = () => {
  const { handleNewApplicationClick, handleMoreInfoClick, t } = useComponent();

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <StyledContainer>
        <StyledTextContainer>
          <StyledHeading>{t('common:mainIngress.heading')}</StyledHeading>
          <StyledDescription>
            {t('common:mainIngress.description1')}
            <StyledLink onClick={handleMoreInfoClick}>
              {t('common:mainIngress.linkText')}
            </StyledLink>
            {t('common:mainIngress.description2')}
          </StyledDescription>
        </StyledTextContainer>
        <StyledActionContainer>
          <StyledButton
            iconLeft={<IconPlus />}
            onClick={handleNewApplicationClick}
          >
            {t('common:mainIngress.newApplicationBtnText')}
          </StyledButton>
        </StyledActionContainer>
      </StyledContainer>
    </Container>
  );
};

export default ApplicationFormStep1;
