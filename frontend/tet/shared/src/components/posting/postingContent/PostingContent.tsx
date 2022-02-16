import React from 'react';
import { TetData } from 'tet/shared/types/TetData';
import Container from 'shared/components/container/Container';
import PostingInfoItem from 'tet/shared/src/components/posting/postingInfoItem/PostingInfoItem';
import {
  $ContentWrapper,
  $Body,
  $InfoWrapper,
  $Title,
} from 'tet/shared/src/components/posting/postingContent/PostingContent.sc';
import { IconCalendarClock, IconLocation, IconInfoCircle } from 'hds-react';
import PostingShareLinks from 'tet/shared/src/components/posting/postingShareLinks/PostingShareLinks';
import getFormattedDate from 'tet/shared/util/getFormattedDate';
import { useTranslation } from 'next-i18next';

type Props = {
  posting: TetData;
};

const PostingContent: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const addressList = [
    'TEST Kallin kirjasto',
    'TEST Viides Linja 11',
    'TEST 00530 Helsinki',
  ];
  const contact = [posting.contact_phone, posting.contact_email];
  const languages = ['TEST Suomi', 'TEST Ruotsi'];

  const date =
    posting.start_date + (posting.end_date ? ` - ${posting.end_date}` : '');
  //const date = `${getFormattedDate('10-10-2022')}`;

  return (
    <Container>
      <$ContentWrapper>
        <$Body>
          <$Title>{posting.org_name}</$Title>
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
            body={languages}
            icon={<IconInfoCircle />}
          />
        </$InfoWrapper>
      </$ContentWrapper>
    </Container>
  );
};

export default PostingContent;
