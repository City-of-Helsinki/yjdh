import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useTheme } from 'styled-components';
import {
  $ImageContainer,
  $PostingAddress,
  $PostingCard,
  $PostingCardBody,
  $PostingCardBodyFooter,
  $PostingDate,
  $PostingDescription,
  $PostingLanguages,
  $PostingSubtitle,
  $PostingTitle,
} from 'tet/youth/components/jobPostingCard/JobPostingCard.sc';
import { OptionType } from 'tet-shared/types/classification';
import JobPosting from 'tet-shared/types/tetposting';
import getUiEndDate from 'tet-shared/utils/get-ui-end-date';

import JobPostingCardKeywords from './JobPostingCardKeywords';

type Props = {
  jobPosting: JobPosting;
};

const JobPostingCard: React.FC<Props> = ({ jobPosting }) => {
  const theme = useTheme();
  const router = useRouter();
  const params = router.query;
  const { t } = useTranslation();

  const date = `${jobPosting.start_date} - ${getUiEndDate(jobPosting.end_date)}`;
  const street_address = jobPosting.location.street_address ? `, ${jobPosting.location.street_address}` : '';
  const postal_code = jobPosting.location.postal_code ? `, ${jobPosting.location.postal_code}` : '';
  const city = jobPosting.location.city ? `, ${jobPosting.location.city}` : '';
  const address = jobPosting.location.name + street_address + postal_code + city;
  const languages = jobPosting.languages.map((language: OptionType) => language.label).join(', ');
  const imageUrl = jobPosting?.image_url?.length ? jobPosting.image_url : '/event_placeholder_B.jpg';

  const readMoreHandler = (): void => {
    void router.push(
      {
        pathname: '/postings/show',
        query: {
          id: jobPosting.id,
          ...params,
        },
      },
      {
        pathname: '/postings/show',
        query: { id: jobPosting.id },
      },
    );
  };

  return (
    <$PostingCard onClick={readMoreHandler}>
      <$ImageContainer imageUrl={imageUrl} />
      <$PostingCardBody>
        <JobPostingCardKeywords jobPosting={jobPosting} />
        <$PostingSubtitle>{jobPosting.organization_name}</$PostingSubtitle>
        <$PostingTitle>{jobPosting.org_name}</$PostingTitle>
        <$PostingSubtitle>{jobPosting.title}</$PostingSubtitle>
        <$PostingDate>{date}</$PostingDate>
        <$PostingAddress> {address}</$PostingAddress>
        <$PostingDescription>{jobPosting.description}</$PostingDescription>
        <$PostingLanguages>
          <span>{t('common:postings.languages')}:</span> {languages}
        </$PostingLanguages>
        <$PostingCardBodyFooter>
          <Button
            style={{
              fontSize: '20px',
              backgroundColor: `${theme.colors.black60}`,
              borderColor: `${theme.colors.black60}`,
            }}
            role="link"
            size="small"
            type="button"
          >
            {t('common:postings.readMore')}
          </Button>
        </$PostingCardBodyFooter>
      </$PostingCardBody>
    </$PostingCard>
  );
};

export default JobPostingCard;
