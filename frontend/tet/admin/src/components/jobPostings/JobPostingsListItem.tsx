import * as React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
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
} from 'tet/admin/components/jobPostings/JobPostingsListItem.sc';
import { IconMenuDots, IconCalendar, IconGroup, IconEye, IconPhoto } from 'hds-react';
import JobPostingsListItemMenu from 'tet/admin/components/jobPostings/JobPostingsListItemMenu';
type JobPostingsListItemProps = {
  posting: TetPosting;
};

const JobPostingsListItem: React.FC<JobPostingsListItemProps> = ({ posting }) => {
  //const startingDate = DateTime.fromISO(posting.start_date).toFormat('dd.mm.yyyy');
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <>
      <$PostingCard>
        <$ImageContainer>
          <IconPhoto />
        </$ImageContainer>
        <$PostingCardBody>
          <$PostingHeader>
            <div>
              <$PostingTitle>
                {posting.title} {posting.org_name}
              </$PostingTitle>
              <$PostingDescription>{posting.description}</$PostingDescription>
            </div>
            <$MenuContainer>
              <IconMenuDots
                aria-hidden="true"
                css={`
                  cursor: pointer;
                `}
                onClick={() => setShowMenu(true)}
              />
              <JobPostingsListItemMenu show={showMenu} onClickOutside={() => setShowMenu(false)} />
            </$MenuContainer>
          </$PostingHeader>
          <$PostingFooter>
            <div>
              <IconCalendar />
              <$PostingFooterInfo>6.6.2022</$PostingFooterInfo>
            </div>
            <div>
              <IconGroup />
              <$PostingFooterInfo>{posting.spots} TET-paikkaa</$PostingFooterInfo>
            </div>
            <div>
              <IconEye />
              {posting.date_published ? (
                <$PostingFooterInfo>Julkaistu</$PostingFooterInfo>
              ) : (
                <$PostingFooterInfo>Ei julkaistu</$PostingFooterInfo>
              )}
            </div>
          </$PostingFooter>
        </$PostingCardBody>
      </$PostingCard>
    </>
  );
};

export default JobPostingsListItem;
