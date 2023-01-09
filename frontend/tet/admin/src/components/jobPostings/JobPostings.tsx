import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { useQuery } from 'react-query';
import Container from 'shared/components/container/Container';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useConfirm from 'shared/hooks/useConfirm';
import theme from 'shared/styles/theme';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import JobPostingsList from 'tet/admin/components/jobPostings/JobPostingsList';
import ErrorText from 'tet-shared/components/ErrorText/ErrorText';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import { TetEvents } from 'tet-shared/types/linkedevents';

import { $Heading, $HeadingContainer } from './JobPostings.sc';

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const { eventsToTetPostings } = useEventPostingTransformation();
  const { isLoading, data, error } = useQuery<TetEvents, Error>(BackendEndpoint.TET_POSTINGS);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    return <ErrorText>{t('common:application.jobPostings.resultsError')}</ErrorText>;
  }

  const postings = eventsToTetPostings(data);

  const confirmTerms = async (): Promise<void> => {
    const isConfirmed = await confirm({
      header: t('common:application.createTerms'),
      submitButtonLabel: t('common:application.accept'),
    });

    if (isConfirmed) {
      void router.push('/new');
    }
  };

  const content =
    postings.draft.length > 0 || postings.published.length > 0 || postings.expired.length > 0 ? (
      <JobPostingsList {...postings} />
    ) : (
      <p>{t('common:application.jobPostings.noPostingsFound')}</p>
    );

  return (
    <Container backgroundColor={theme.colors.silverLight}>
      <$HeadingContainer>
        <$Heading>{t('common:application.jobPostings.title')}</$Heading>
      </$HeadingContainer>
      <Button onClick={confirmTerms}>{t('common:application.jobPostings.addNewPosting')}</Button>
      {content}
    </Container>
  );
};

export default JobPostings;
