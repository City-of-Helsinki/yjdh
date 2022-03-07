import React from 'react';
import { TetData } from 'tet-shared/types/TetData';
import Container from 'shared/components/container/Container';
import PostingInfoItem from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem';
import {
  $ContentWrapper,
  $Body,
  $InfoWrapper,
  $Title,
} from 'tet-shared//components/posting/postingContent/PostingContent.sc';
import { IconCalendarClock, IconLocation, IconInfoCircle } from 'hds-react';
import { useTranslation } from 'next-i18next';

type Props = {
  posting: TetData;
};

const PostingContent: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const addressList = [
    posting.location.name,
    posting.location.street_address,
    `${posting.location.postal_code} ${posting.location.city}`,
  ];
  const contact = [posting.contact_phone, posting.contact_email];

  const date =
    posting.start_date + (posting.end_date ? ` - ${posting.end_date}` : '');

  return (
    <Container>
      <$ContentWrapper>
        <$Body>
          <$Title>{posting.title}</$Title>
          <div>{posting.description}</div>
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
            body={posting.languages}
            icon={<IconInfoCircle />}
          />
        </$InfoWrapper>
      </$ContentWrapper>
    </Container>
  );
};

export default PostingContent;
