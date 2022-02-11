import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import Container from 'shared/components/container/Container';
import {
  $PostingHero,
  $ImageContainer,
  $HeroWrapper,
  $HeroContentWrapper,
  $Keywords,
  $Title,
  $Date,
  $Address,
} from 'tet/shared/components/posting/postingHero/PostingHero.sc';
import { IconLocation, Button, Tag } from 'hds-react';
import { useTheme } from 'styled-components';

type Props = {
  posting: TetPosting;
};

const PostingHero: React.FC<Props> = ({ posting }) => {
  const theme = useTheme();

  const handleContactClick = (): void => {
    //TODO
  };

  const keywords = ['Asiakaspalvelu', 'Taide ja kulttuuri', 'Soveltuu viittomakielisille'];

  return (
    <$PostingHero>
      <Container>
        <$HeroWrapper>
          <$ImageContainer
            imageUrl={'https://kirkanta.kirjastot.fi/files/images/medium/kallio-4f901aa2.jpg'}
          ></$ImageContainer>
          <$HeroContentWrapper>
            <$Keywords>
              {keywords.map((keyword) => (
                <li>
                  <Tag>{keyword}</Tag>
                </li>
              ))}
            </$Keywords>
            <$Title>{posting.title}</$Title>
            <$Date>11.10.2021-15.10.2021</$Date>
            <$Address>
              <IconLocation />
              <span>Kallion kirjasto, Viides Linja 11, 00530 Helsinki</span>
            </$Address>
            <Button
              css={`
                background-color: ${theme.colors.copperDark};
                border-color: ${theme.colors.copperDark};
              `}
              color={theme.colors.copperDark}
              onClick={handleContactClick}
              variant="success"
            >
              Ota yhteyttä
            </Button>
          </$HeroContentWrapper>
        </$HeroWrapper>
      </Container>
    </$PostingHero>
  );
};

export default PostingHero;
