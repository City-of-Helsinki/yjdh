// eslint-disable-next-line import/no-extraneous-dependencies
import {
  IconCalendarClock,
  IconInfoCircle,
  IconLocation,
  IconGlobe,
  Tag,
} from 'hds-react';
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
  $Keywords,
} from 'tet-shared//components/posting/postingContent/PostingContent.sc';
import PostingInfoItem from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem';
import MapScripts from 'tet-shared/components/MapScripts';
import TetPosting from 'tet-shared/types/tetposting';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  posting: TetPosting;
};

const LocationMap = dynamic(
  () => import('tet-shared/components/map/LocationMap'),
  {
    ssr: false,
  }
);

const keywordList = (list: OptionType[], color: string): JSX.Element => (
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
          {posting?.location?.position?.coordinates.length > 1 && (
            <LocationMap posting={posting} zoom={14} />
          )}
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
            icon={<IconGlobe />}
          />
          <$Keywords>
            {keywordList(posting.keywords_working_methods, 'success-light')}
            {keywordList(
              posting.keywords_attributes,
              'coat-of-arms-medium-light'
            )}
            {keywordList(posting.keywords, 'engel-medium-light')}
          </$Keywords>
        </$InfoWrapper>
      </$ContentWrapper>
      <MapScripts />
    </Container>
  );
};

export default PostingContent;
