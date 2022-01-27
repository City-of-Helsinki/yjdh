import * as React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useTranslation } from 'next-i18next';
import JobPostingsListItem from 'tet/admin/components/jobPostings/JobPostingsListItem';
import { $HeadingContainer, $Title, $Total } from 'tet/admin/components/jobPostings/JobPostingsSectio.sc';

type JobPostingsSectionProps = {
  title: String;
  postingsTotal: number;
  postings: TetPosting[];
};

const JobPostingsSection: React.FC<JobPostingsSectionProps> = ({ title, postingsTotal, postings }) => {
  console.log(postings, 'postings');
  return (
    <>
      <$HeadingContainer>
        <$Title>{title}</$Title>
        <$Total>{postingsTotal} kpl</$Total>
      </$HeadingContainer>
      {postings.map((posting) => (
        <JobPostingsListItem posting={posting} />
      ))}
    </>
  );
};

export default JobPostingsSection;
