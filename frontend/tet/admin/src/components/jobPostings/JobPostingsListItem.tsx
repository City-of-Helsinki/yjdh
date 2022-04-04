import * as React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import {
  $PostingCard,
  $ImageContainer,
  $PostingCardBody,
  $PostingTitle,
  $PostingDescription,
  $PostingHeader,
  $PostingFooter,
  $PostingFooterInfo,
  $MenuContainer,
  $PostingDates,
} from 'tet/admin/components/jobPostings/JobPostingsListItem.sc';
import { IconMenuDots, IconCalendar, IconGroup, IconEye, IconEyeCrossed } from 'hds-react';
import { useTranslation } from 'next-i18next';
import JobPostingsListItemMenu from 'tet/admin/components/jobPostings/JobPostingsListItemMenu';
import Image from 'next/image';
type JobPostingsListItemProps = {
  posting: TetPosting;
};

const JobPostingsListItem: React.FC<JobPostingsListItemProps> = ({ posting }) => {
  //const startingDate = DateTime.fromISO(posting.start_date).toFormat('dd.mm.yyyy');
  const [showMenu, setShowMenu] = React.useState(false);
  const { t } = useTranslation();

  const startDate = posting.start_date;
  const endDate = posting.end_date;

  return (
    <$PostingCard>
      <$ImageContainer>
        <Image
          width="100%"
          height="100%"
          layout="responsive"
          objectFit="cover"
          src="/event_placeholder_B.jpg"
          alt="event placeholder"
        />
      </$ImageContainer>
      <$PostingCardBody>
        <$PostingHeader>
          <div>
            <$PostingTitle>
              {posting.title} - {posting.org_name}
            </$PostingTitle>
            <$PostingDescription>{posting.description}</$PostingDescription>
          </div>
          <$MenuContainer>
            <button type="button" onClick={() => setShowMenu(true)}>
              <IconMenuDots
                aria-hidden="true"
                css={`
                  cursor: pointer;
                `}
              />
            </button>
            {posting.id && (
              <JobPostingsListItemMenu posting={posting} show={showMenu} onClickOutside={() => setShowMenu(false)} />
            )}
          </$MenuContainer>
        </$PostingHeader>
        <$PostingFooter>
          <$PostingDates>
            <IconCalendar />
            <$PostingFooterInfo>
              {startDate}-{endDate}
            </$PostingFooterInfo>
          </$PostingDates>
          <div>
            <IconGroup />
            <$PostingFooterInfo>
              {t('common:application.jobPostings.openSpots', { count: posting.spots })}
            </$PostingFooterInfo>
          </div>
          {posting.date_published ? (
            <div>
              <IconEye />
              <$PostingFooterInfo>{t('common:application.jobPostings.published')}</$PostingFooterInfo>
            </div>
          ) : (
            <div>
              <IconEyeCrossed />
              <$PostingFooterInfo>{t('common:application.jobPostings.notPublished')}</$PostingFooterInfo>
            </div>
          )}
        </$PostingFooter>
      </$PostingCardBody>
    </$PostingCard>
  );
};

export default JobPostingsListItem;
