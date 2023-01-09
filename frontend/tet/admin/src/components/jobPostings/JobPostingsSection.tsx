import { useTranslation } from 'next-i18next';
import * as React from 'react';
import JobPostingsListItem from 'tet/admin/components/jobPostings/JobPostingsListItem';
import { $HeadingContainer, $Title, $Total } from 'tet/admin/components/jobPostings/JobPostingsSectio.sc';
import TetPosting, { TetPostings } from 'tet-shared/types/tetposting';

type JobPostingsSectionProps = {
  title: string;
  postingsTotal: number;
  postings: TetPosting[];
  sectionId: keyof TetPostings;
};

const JobPostingsSection: React.FC<JobPostingsSectionProps> = ({ title, postingsTotal, postings, sectionId }) => {
  const { t } = useTranslation();
  return (
    <div data-testid={`${sectionId}-list`}>
      <$HeadingContainer>
        <$Title>{title}</$Title>
        <$Total>
          {postingsTotal} {t('common:application.jobPostings.total')}
        </$Total>
      </$HeadingContainer>
      {postings.map((posting) => (
        <JobPostingsListItem key={posting.id} posting={posting} sectionId={sectionId} />
      ))}
    </div>
  );
};

export default JobPostingsSection;
