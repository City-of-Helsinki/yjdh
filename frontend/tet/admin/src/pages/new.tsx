import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Container from 'shared/components/container/Container';
import { $Heading, $HeadingContainer } from 'tet/admin/components/jobPostings/JobPostings.sc';
import Editor from 'tet/admin/components/editor/Editor';
import { useTranslation } from 'next-i18next';
import PostingContainer from 'tet/shared/components/posting/PostingContainer';
import { useQuery } from 'react-query';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import PreviewWrapper from 'tet/admin/components/editor/previewWrapper/PreviewWrapper';

const NewPostingPage: NextPage = () => {
  const { t } = useTranslation();

  const { isLoading, data } = useQuery<TetPostings>(BackendEndpoint.TET_POSTINGS);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  const { draft } = data;

  return (
    <PreviewWrapper>
      <PostingContainer posting={draft[0]} />
    </PreviewWrapper>
  );

  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:editor.newTitle')}</$Heading>
      </$HeadingContainer>
      <Editor />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default NewPostingPage;
