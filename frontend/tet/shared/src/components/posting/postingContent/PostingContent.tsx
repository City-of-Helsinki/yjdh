// eslint-disable-next-line import/no-extraneous-dependencies
import {
  IconCalendarClock,
  IconGlobe,
  IconInfoCircle,
  IconLocation,
  Link,
  Tag,
} from 'hds-react';
import dynamic from 'next/dynamic';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useTranslation } from 'next-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import Container from 'shared/components/container/Container';
import { useTheme } from 'styled-components';
import {
  $Body,
  $ContentWrapper,
  $Hr,
  $InfoWrapper,
  $Keywords,
  $Title,
} from 'tet-shared//components/posting/postingContent/PostingContent.sc';
import PostingInfoItem from 'tet-shared//components/posting/postingInfoItem/PostingInfoItem';
import MapScripts from 'tet-shared/components/MapScripts';
import { OptionType } from 'tet-shared/types/classification';
import TetPosting from 'tet-shared/types/tetposting';

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
            '--tag-background': `${color}`,
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

const stripHttp = (url: string) => url.replace(/^https?:\/\//i, '');

const PostingContent: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const addressList = posting.location
    ? [
        posting.location.name,
        posting.location.street_address,
        `${posting.location.postal_code} ${posting.location.city}`,
      ]
    : null;
  const contact = [posting.contact_phone, posting.contact_email];

  const date = `${posting.start_date} - ${posting.end_date ?? ''}`;
  const websiteLink = posting.website_url ? (
    <Link
      href={posting.website_url}
      external
      openInNewTab
      openInNewTabAriaLabel={t('common:footer.newTab')}
      openInExternalDomainAriaLabel={t('common:opensInNewPage')}
      rel="noopener noreferrer"
    >
      {stripHttp(posting.website_url)}
    </Link>
  ) : null;
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
          {posting.location && (
            <PostingInfoItem
              title={t('common:postingTemplate.location')}
              body={addressList}
              icon={<IconLocation />}
            />
          )}
          <PostingInfoItem
            title={t('common:postingTemplate.contact')}
            body={contact}
            icon={<IconInfoCircle />}
          />
          {websiteLink && (
            <PostingInfoItem
              title={t('common:editor.posting.website')}
              body={websiteLink}
              icon={<IconGlobe />}
            />
          )}
          <PostingInfoItem
            title={t('common:postingTemplate.languages')}
            body={languages}
            icon={<IconGlobe />}
          />
          <$Keywords>
            {keywordList(
              posting.keywords_working_methods,
              theme.colors.successLight
            )}
            {keywordList(
              posting.keywords_attributes,
              theme.colors.coatOfArmsMediumLight
            )}
            {keywordList(posting.keywords, theme.colors.engelMediumLight)}
          </$Keywords>
        </$InfoWrapper>
      </$ContentWrapper>
      <MapScripts />
    </Container>
  );
};

export default PostingContent;
