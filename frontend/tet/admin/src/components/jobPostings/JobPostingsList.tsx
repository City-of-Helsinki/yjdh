import * as React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useTranslation } from 'next-i18next';
import JobPostingsSection from 'tet/admin/components/jobPostings/JobPostingsSection';

type JobPostingsListProps = {
  draft: TetPosting[];
  published: TetPosting[];
};

const JobPostingsList: React.FC<JobPostingsListProps> = ({ draft, published }) => {
  const { t } = useTranslation();
  return (
    <>
      <JobPostingsSection
        title={t('common:application.jobPostings.publishedPostings')}
        postingsTotal={published.length}
        postings={published}
        sectionId="published"
      ></JobPostingsSection>
      <JobPostingsSection
        title={t('common:application.jobPostings.draftPostings')}
        postingsTotal={draft.length}
        postings={draft}
        sectionId="draft"
      ></JobPostingsSection>
    </>
  );
};

export default JobPostingsList;
