import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useRouter } from 'next/router';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import useGetSingePosting from 'tet/youth/hooks/backend/useGetSingePosting';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import PageNotFound from 'shared/components/pages/PageNotFound';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';
import HeaderLinks from 'tet-shared/components/HeaderLinks';

const ShowPostingPage: NextPage = () => {
  const router = useRouter();
  const { eventToTetPosting, keywordResult } = useEventPostingTransformation();
  const id = router.query.id as string;
  const { isLoading, data, error } = useGetSingePosting(id);

  if (isLoading || keywordResult.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error || keywordResult.error) {
    return <PageNotFound />;
  }

  if (data) {
    return (
      <>
        <HeaderLinks />
        <PostingContainer posting={eventToTetPosting(data)} showBackButton={true} />;
      </>
    );
  } else {
    return <PageNotFound />;
  }
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowPostingPage;
