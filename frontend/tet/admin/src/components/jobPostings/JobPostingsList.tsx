import * as React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useTranslation } from 'next-i18next';
import JobPostingsSection from 'tet/admin/components/jobPostings/JobPostingsSection';

type JobPostingsListProps = {
  draft: TetPosting[];
  published: TetPosting[];
};

const JobPostingsList: React.FC<JobPostingsListProps> = ({ draft, published }) => {
  return (
    <>
      <JobPostingsSection
        title="Työharjoittelupaikat"
        postingsTotal={published.length}
        postings={published}
      ></JobPostingsSection>
      <JobPostingsSection
        title="Keskeneräiset ilmoitukset"
        postingsTotal={draft.length}
        postings={draft}
      ></JobPostingsSection>
    </>
  );
};

export default JobPostingsList;
