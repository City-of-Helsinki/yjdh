import * as React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

type JobPostingsListProps = {
  postings: TetPosting[];
};

const JobPostingsList: React.FC<JobPostingsListProps> = ({ postings }) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Button onClick={() => router.push('/new')}>{t('common:application.jobPostings.addNewPosting')}</Button>
      <ul>
        {postings.map((posting) => (
          <li key={posting.id}>
            {posting.title} - {posting.description}{' '}
            <span onClick={() => router.push(`/edit/${posting.id!}`)}>EDIT</span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default JobPostingsList;
