import * as React from 'react';
import {
  $PostingCard,
  $ImageContainer,
  $PostingCardBody,
  $PostingCardBodyFooter,
  $PostingTitle,
  $PostingSubtitle,
  $PostingDescription,
  $PostingAddress,
  $PostingDate,
} from 'tet/youth/components/eventList/JobPostingCard/JobPostingCard.sc';
import JobPostingCardKeywords from './JobPostingCardKeywords';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { IconPhoto } from 'hds-react';
import { Button } from 'hds-react';
import { useTheme } from 'styled-components';

type Props = {
  jobPosting: any;
};

const JobPostingCard: React.FC<Props> = ({ jobPosting }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const date = jobPosting.start_date + (jobPosting.end_date ? ` - ${jobPosting.end_date}` : '');
  const street_address = jobPosting.location.street_address ? `, ${jobPosting.location.street_address}` : '';
  const postal_code = jobPosting.location.postal_code ? `, ${jobPosting.location.postal_code}` : '';
  const city = jobPosting.location.city ? `, ${jobPosting.location.city}` : '';
  const address = jobPosting.location.name + street_address + postal_code + city;

  const readMoreHandler = () => {
    void router.push({
      pathname: '/postings/show',
      query: { id: jobPosting.id },
    });
  };

  return (
    <$PostingCard>
      <$ImageContainer>
        <IconPhoto />
      </$ImageContainer>
      <$PostingCardBody>
        <JobPostingCardKeywords jobPosting={jobPosting} />
        <$PostingTitle>{jobPosting.org_name}</$PostingTitle>
        <$PostingSubtitle>{jobPosting.title}</$PostingSubtitle>
        <$PostingDate>{date}</$PostingDate>
        <$PostingAddress> {address}</$PostingAddress>
        <$PostingDescription>{jobPosting.description}</$PostingDescription>
        <$PostingCardBodyFooter>
          <Button
            style={{
              fontSize: '20px',
              backgroundColor: `${theme.colors.black60}`,
              borderColor: `${theme.colors.black60}`,
            }}
            aria-label={t('event.eventCard.ariaLabelReadMore', { name })}
            onClick={readMoreHandler}
            size="small"
            type="button"
          >
            Lue lisää
          </Button>
        </$PostingCardBodyFooter>
      </$PostingCardBody>
    </$PostingCard>
  );
};

export default JobPostingCard;
