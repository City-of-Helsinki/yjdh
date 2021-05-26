import * as React from 'react';
import { IconPlus } from 'hds-react';
import {
  StyledContainer,
  StyledTextContainer,
  StyledHeading,
  StyledDescription,
  StyledLink,
  StyledActionContainer,
  StyledButton,
} from './styled';
import { useComponent } from './extended';

const MainIngress: React.FC = () => {
  const { handleMoreInfoClick, t } = useComponent();

  return (
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
        <StyledButton iconLeft={<IconPlus />}>
          {t('common:mainIngress.newApplicationBtnText')}
        </StyledButton>
      </StyledActionContainer>
    </StyledContainer>
  );
};

export default MainIngress;
