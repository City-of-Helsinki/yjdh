import { IconArrowLeft, IconLocation } from 'hds-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'tet-shared/components/container/Container';
import {
  $Address,
  $BackButton,
  $ContactInfo,
  $ContactTitle,
  $Date,
  $HeroContentWrapper,
  $HeroWrapper,
  $ImageContainer,
  $PostingHero,
  $Spots,
  $Subtitle,
  $Title,
} from 'tet-shared/components/posting/postingHero/PostingHero.sc';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  posting: TetPosting;
  showBackButton: boolean;
  onReturnClick?: () => void;
};

const PostingHero: React.FC<Props> = ({
  posting,
  showBackButton = false,
  onReturnClick,
}) => {
  const { t } = useTranslation();
  const date = `${posting.start_date} - ${posting.end_date ?? ''}`;
  const street_address = posting?.location?.street_address
    ? `, ${posting.location.street_address}`
    : '';
  const postal_code = posting?.location?.postal_code
    ? `, ${posting.location.postal_code}`
    : '';
  const city = posting?.location?.city ? `, ${posting.location.city}` : '';
  const name = posting?.location?.name ?? '';
  const address = name + street_address + postal_code + city;

  return (
    <$PostingHero>
      <Container>
        <$HeroWrapper>
          {showBackButton && (
            <$BackButton id="backButton" onClick={onReturnClick}>
              <IconArrowLeft size="m" />
            </$BackButton>
          )}
          <$ImageContainer imageUrl="https://kirkanta.kirjastot.fi/files/images/medium/kallio-4f901aa2.jpg">
            <Image
              width="100%"
              height="100%"
              layout="responsive"
              objectFit="cover"
              src="/event_placeholder_B.jpg"
              alt="event placeholder"
              priority
            />
          </$ImageContainer>
          <$HeroContentWrapper>
            <$Title>{posting.org_name}</$Title>
            <$Subtitle id="postingTitle">{posting.title}</$Subtitle>
            <$Date>{date}</$Date>
            <$Spots>
              {t('common:postingTemplate.spots')}: {posting.spots}
            </$Spots>
            <$Address>
              <IconLocation />
              <span>{address}</span>
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
