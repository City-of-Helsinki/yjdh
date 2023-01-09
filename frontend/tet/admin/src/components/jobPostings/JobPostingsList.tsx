import { useTranslation } from 'next-i18next';
import * as React from 'react';
import JobPostingsSection from 'tet/admin/components/jobPostings/JobPostingsSection';
import { TetPostings } from 'tet-shared/types/tetposting';

const JobPostingsList: React.FC<TetPostings> = ({ draft, published, expired }) => {
  const { t } = useTranslation();
  return (
    <>
      <JobPostingsSection
        title={t('common:application.jobPostings.publishedPostings')}
        postingsTotal={published.length}
        postings={published}
        sectionId="published"
      />
      <JobPostingsSection
        title={t('common:application.jobPostings.draftPostings')}
        postingsTotal={draft.length}
        postings={draft}
        sectionId="draft"
      />
      <JobPostingsSection
        title={t('common:application.jobPostings.expiredPostings')}
        postingsTotal={expired.length}
        postings={expired}
        sectionId="expired"
      />
    </>
  );
};

export default JobPostingsList;
