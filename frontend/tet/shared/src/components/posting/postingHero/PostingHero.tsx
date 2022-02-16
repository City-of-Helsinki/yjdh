import React from 'react';
import { TetData } from 'tet-shared/types/TetData';
import Container from 'tet-shared//components/container/Container';
import {
  $PostingHero,
  $ImageContainer,
  $HeroWrapper,
  $HeroContentWrapper,
  $Keywords,
  $Title,
  $Subtitle,
  $Date,
  $Spots,
  $Address,
  $ContactTitle,
  $ContactInfo,
} from 'tet-shared//components/posting/postingHero/PostingHero.sc';
import { useTranslation } from 'next-i18next';
import { IconLocation, Button, Tag } from 'hds-react';

type Props = {
  posting: TetData;
};

const PostingHero: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const keywords = [
    'TEST Asiakaspalvelu',
    'TEST Taide ja kulttuuri',
    'TEST Soveltuu viittomakielisille',
  ];
  const date =
    posting.start_date + (posting.end_date ? ` - ${posting.end_date}` : '');

  return (
    <$PostingHero>
      <Container>
        <$HeroWrapper>
          <$ImageContainer
            imageUrl={
              'https://kirkanta.kirjastot.fi/files/images/medium/kallio-4f901aa2.jpg'
            }
          ></$ImageContainer>
          <$HeroContentWrapper>
            <$Keywords>
              {keywords.map((keyword) => (
                <li>
                  <Tag
                    theme={{
                      '--tag-background': 'var(--color-success-light)',
                      '--tag-color': 'var(--color-black-90)',
                      '--tag-focus-outline-color': 'var(--color-black-90)',
                    }}
                  >
                    {keyword}
                  </Tag>
                </li>
              ))}
            </$Keywords>
            <$Title>{posting.org_name}</$Title>
            <$Subtitle>{posting.title}</$Subtitle>
            <$Date>{date}</$Date>
            <$Spots>
              {t('common:postingTemplate.spots')}: {posting.spots}
            </$Spots>
            <$Address>
              <IconLocation />
              <span>
                TEST Kallion kirjasto, Viides Linja 11, 00530 Helsinki
              </span>
            </$Address>
            <$ContactTitle>{t('common:postingTemplate.contact')}</$ContactTitle>
            <$ContactInfo>
              <li>
                {posting.contact_first_name} {posting.contact_last_name}
              </li>
              <li>{posting.contact_phone}</li>
              <li>{posting.contact_email}</li>
            </$ContactInfo>
          </$HeroContentWrapper>
        </$HeroWrapper>
      </Container>
    </$PostingHero>
  );
};

export default PostingHero;
