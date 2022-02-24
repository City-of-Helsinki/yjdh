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
} from 'tet/youth/components/eventList/JobPostingCard/JobPostingCard.sc';
import JobPostingCardKeywords from './JobPostingCardKeywords';
import { useTranslation } from 'next-i18next';
import { IconPhoto } from 'hds-react';
import { Button } from 'hds-react';
import { useTheme } from 'styled-components';

const getLocalizedString = (obj: LocalizedObject): string => obj.fi;

type Props = {
  jobPosting: any;
};

const JobPostingCard: React.FC<Props> = ({ jobPosting }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { t } = useTranslation();
  const theme = useTheme();

  const readMoreHandler = () => {};

  return (
    <$PostingCard>
      <$ImageContainer>
        <IconPhoto />
      </$ImageContainer>
      <$PostingCardBody>
        <JobPostingCardKeywords props={jobPosting.keywords} />
        <$PostingTitle>{getLocalizedString(jobPosting.name)}</$PostingTitle>
        <$PostingSubtitle>{getLocalizedString(jobPosting.name)}</$PostingSubtitle>
        <$PostingAddress> Osoite</$PostingAddress>
        <$PostingDescription>{getLocalizedString(jobPosting.description)}</$PostingDescription>
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
