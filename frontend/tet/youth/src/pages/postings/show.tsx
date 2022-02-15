import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useRouter } from 'next/router';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import { eventToTetPosting } from 'tet-shared/backend-api/transformations';
import useGetSingePosting from 'tet/youth/hooks/backend/useGetSingePosting';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import useKeywordType from 'tet-shared/hooks/backend/useKeywordType';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import PageNotFound from 'shared/components/pages/PageNotFound';

const ShowPostingPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, data, error } = useGetSingePosting(id);
  const keywordResult = useKeywordType();
  const languageOptions = useLanguageOptions();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    //TODO
    return <PageNotFound />;
  }

  if (data) {
    return (
      <PostingContainer
        posting={eventToTetPosting(data, keywordResult.getKeywordType, languageOptions)}
        showBackButton={true}
      />
    );
  } else {
    return <PageNotFound />;
  }
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowPostingPage;
