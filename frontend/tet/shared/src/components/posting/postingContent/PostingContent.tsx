// eslint-disable-next-line import/no-extraneous-dependencies
import { IconCalendarClock, IconInfoCircle, IconLocation } from 'hds-react';
import dynamic from 'next/dynamic';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useTranslation } from 'next-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Body,
  $ContentWrapper,
  $Hr,
  $InfoWrapper,
  $Title,
} from 'tet-shared//components/posting/postingContent/PostingContent.sc';
import PostingInfoItem from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  posting: TetPosting;
};

const Map = dynamic(() => import('tet-shared/components/map/Map'), {
  ssr: false,
});

const PostingContent: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const addressList = [
    posting.location.name,
    posting.location.street_address,
    `${posting.location.postal_code} ${posting.location.city}`,
  ];
  const contact = [posting.contact_phone, posting.contact_email];

  const date = `${posting.start_date} - ${posting.end_date ?? ''}`;
  const languages = posting.languages.map((language) => language.label);

  return (
    <Container>
      <$ContentWrapper>
        <$Body>
          <$Title>{posting.title}</$Title>
          <div>{posting.description}</div>
          <$Hr />
          <Map postings={[posting]} zoom={12} zoomToPosition />
        </$Body>
        <$InfoWrapper>
          <PostingInfoItem
            title={t('common:postingTemplate.dateAndTime')}
            body={date}
            icon={<IconCalendarClock />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.location')}
            body={addressList}
            icon={<IconLocation />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.contact')}
            body={contact}
            icon={<IconInfoCircle />}
          />
          <PostingInfoItem
            title={t('common:postingTemplate.languages')}
            body={languages}
            icon={<IconInfoCircle />}
          />
        </$InfoWrapper>
      </$ContentWrapper>
    </Container>
  );
};

export default PostingContent;
