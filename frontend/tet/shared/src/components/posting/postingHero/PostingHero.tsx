import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
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
  $BackButton,
  $ContactInfo,
} from 'tet-shared//components/posting/postingHero/PostingHero.sc';
import { useTranslation } from 'next-i18next';
import { OptionType } from 'tet-shared/types/classification';
import { IconLocation, IconArrowLeft, Tag } from 'hds-react';
import { useRouter } from 'next/router';
import Image from 'next/image';

type Props = {
  posting: TetPosting;
  showBackButton: boolean;
};

const PostingHero: React.FC<Props> = ({ posting, showBackButton = false }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const date = `${posting.start_date} - ${posting.end_date ?? ''}`;
  const street_address = posting.location.street_address
    ? `, ${posting.location.street_address}`
    : '';
  const postal_code = posting.location.postal_code
    ? `, ${posting.location.postal_code}`
    : '';
  const city = posting.location.city ? `, ${posting.location.city}` : '';
  const address = posting.location.name + street_address + postal_code + city;

  const backButtonHandler = () => {
    void router.push('/postings');
  };

  const keywordList = (list: OptionType[], color: string) => {
    return (
      <>
        {list.map((keyword: OptionType) => (
          <li>
            <Tag
              theme={{
                '--tag-background': `var(--color-${color})`,
                '--tag-color': 'var(--color-black-90)',
                '--tag-focus-outline-color': 'var(--color-black-90)',
              }}
            >
              {keyword.name}
            </Tag>
          </li>
        ))}
      </>
    );
  };

  return (
    <$PostingHero>
      <Container>
        <$HeroWrapper>
          {showBackButton && (
            <$BackButton onClick={backButtonHandler}>
              <IconArrowLeft size="m" />
            </$BackButton>
          )}
          <$ImageContainer
            imageUrl={
              'https://kirkanta.kirjastot.fi/files/images/medium/kallio-4f901aa2.jpg'
            }
          >
            <Image
              width="100%"
              height="100%"
              layout="responsive"
              objectFit="cover"
              src="/event_placeholder_B.jpg"
              alt="event placeholder"
            />
          </$ImageContainer>
          <$HeroContentWrapper>
            <$Keywords>
              {keywordList(posting.keywords_working_methods, 'success-light')}
              {keywordList(
                posting.keywords_attributes,
                'coat-of-arms-medium-light'
              )}
              {keywordList(posting.keywords, 'engel-medium-light')}
            </$Keywords>
            <$Title>{posting.org_name}</$Title>
            <$Subtitle>{posting.title}</$Subtitle>
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
