import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import PageNotFound from 'shared/components/pages/PageNotFound';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import useGetSinglePosting from 'tet/youth/hooks/backend/useGetSinglePosting';
import HeaderLinks from 'tet-shared/components/HeaderLinks';
import useEventPostingTransformation from 'tet-shared/hooks/backend/useEventPostingTransformation';

const ShowPostingPage: NextPage = () => {
  const router = useRouter();
  const { eventToTetPosting, keywordResult } = useEventPostingTransformation();
  const id = router.query.id as string;
  const { isLoading, data, error } = useGetSinglePosting(id);

  const returnHandler = (): void => {
    const params = router.query;
    delete params?.id;
    void router.push({
      pathname: '/postings',
      query: {
        ...params,
      },
    });
  };

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
        <PostingContainer posting={eventToTetPosting(data)} showBackButton onReturnClick={returnHandler} />
      </>
    );
  }
  return <PageNotFound />;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowPostingPage;
