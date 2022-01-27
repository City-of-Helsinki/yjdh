import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { useTranslation } from 'next-i18next';

import { $Heading, $HeadingContainer } from './JobPostings.sc';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { useRouter } from 'next/router';
import { TetPostings } from 'tet/admin/types/tetposting';
import JobPostingsList from 'tet/admin/components/jobPostings/JobPostingsList';

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, data } = useQuery<TetPostings>(BackendEndpoint.TET_POSTINGS);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  console.dir(data);

  const content =
    data?.draft && data?.published ? (
      <JobPostingsList draft={data.draft} published={data.published} />
    ) : (
      <>
        <p>{t('common:application.jobPostings.noPostingsFound')}</p>
      </>
    );

  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:application.jobPostings.title')}</$Heading>
      </$HeadingContainer>
      <Button onClick={() => router.push('/new')}>{t('common:application.jobPostings.addNewPosting')}</Button>
      {content}
    </Container>
  );
};

export default JobPostings;
