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

const MainIngress: React.FC = () => {
  const handleMoreInfoClick = () => {};

  return (
    <StyledContainer>
      <StyledTextContainer>
        <StyledHeading>Hakemukset</StyledHeading>
        <StyledDescription>
          Tästä voit hakea Helsinki-lisää. Tutustu ennen lomakkeen täyttämistä
          <StyledLink onClick={handleMoreInfoClick}>
            {' '}
            hakemiseen vaadittaviin tietoihin ja tarvittaviin liitteisiin
          </StyledLink>
          . Hakemuksen voi myös tallentaa keskenräisenä ja jatkaa sen
          täyttämistä myöhemmin.
        </StyledDescription>
      </StyledTextContainer>
      <StyledActionContainer>
        <StyledButton iconLeft={<IconPlus />}>Tee uusi hakemus</StyledButton>
      </StyledActionContainer>
    </StyledContainer>
  );
};

export default MainIngress;
