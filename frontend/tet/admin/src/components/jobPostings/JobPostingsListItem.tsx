import { IconCalendar, IconEye, IconEyeCrossed, IconGroup, IconMenuDots } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ImageContainer,
  $MenuContainer,
  $PostingCard,
  $PostingCardBody,
  $PostingDates,
  $PostingDescription,
  $PostingFooter,
  $PostingFooterInfo,
  $PostingHeader,
  $PostingTitle,
} from 'tet/admin/components/jobPostings/JobPostingsListItem.sc';
import JobPostingsListItemMenu from 'tet/admin/components/jobPostings/JobPostingsListItemMenu';
import TetPosting from 'tet-shared/types/tetposting';
import getUiEndDate from 'tet-shared/utils/get-ui-end-date';

type JobPostingsListItemProps = {
  posting: TetPosting;
};

const JobPostingsListItem: React.FC<JobPostingsListItemProps> = ({ posting }) => {
  // const startingDate = DateTime.fromISO(posting.start_date).toFormat('dd.mm.yyyy');
  const [showMenu, setShowMenu] = React.useState(false);
  const { t } = useTranslation();

  const startDate = posting.start_date;
  const endDate = getUiEndDate(posting.end_date);
  const imageUrl = posting?.image_url?.length ? posting.image_url : '/event_placeholder_B.jpg';

  return (
    <$PostingCard>
      <$ImageContainer imageUrl={imageUrl} />
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
