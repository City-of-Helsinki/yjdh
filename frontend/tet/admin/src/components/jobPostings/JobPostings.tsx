import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { useTranslation } from 'next-i18next';
import { $Heading, $HeadingContainer } from './JobPostings.sc';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { useRouter } from 'next/router';
import JobPostingsList from 'tet/admin/components/jobPostings/JobPostingsList';
import { TetEvents } from 'tet-shared/types/linkedevents';
import theme from 'shared/styles/theme';
import { eventsToTetPostings } from 'tet-shared/backend-api/transformations';
import useConfirm from 'shared/hooks/useConfirm';

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const { isLoading, data, error } = useQuery<TetEvents, Error>(BackendEndpoint.TET_POSTINGS);
  const router = useRouter();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    // TODO check that error is 403
    // TODO add to translations
    // TODO implement error view for this
    return <div>Virhe latauksessa. Yritä uudestaan tai pyydä sovellukseen käyttöoikeus...</div>;
  }

  const postings = eventsToTetPostings(data);

  const confirmTerms = async () => {
    const isConfirmed = await confirm({
      header: t('common:application.createTerms'),
      submitButtonLabel: t('common:application.accept'),
    });

    if (isConfirmed) {
      void router.push('/new');
    }
  };

  const content =
    postings.draft.length > 0 || postings.published.length > 0 ? (
      <JobPostingsList draft={postings.draft} published={postings.published} />
    ) : (
      <>
        <p>{t('common:application.jobPostings.noPostingsFound')}</p>
      </>
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
