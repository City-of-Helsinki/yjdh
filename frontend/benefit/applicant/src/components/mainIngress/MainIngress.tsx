import { IconPlus } from 'hds-react';
import * as React from 'react';

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
