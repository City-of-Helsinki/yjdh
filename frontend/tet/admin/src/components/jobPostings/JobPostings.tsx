import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { useTranslation } from 'next-i18next';

import { $Heading, $HeadingContainer } from './JobPostings.sc';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet-shared/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { useRouter } from 'next/router';

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, data } = useQuery(BackendEndpoint.TET_POSTINGS);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  console.dir(data);

  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:application.jobPostings.title')}</$Heading>
      </$HeadingContainer>
      <p>{t('common:application.jobPostings.noPostingsFound')}</p>
      <Button onClick={() => router.push('/new')}>{t('common:application.jobPostings.addNewPosting')}</Button>
    </Container>
  );
};

export default JobPostings;
