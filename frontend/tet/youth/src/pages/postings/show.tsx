import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useRouter } from 'next/router';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';
import useGetSingePosting from 'tet/youth/hooks/backend/useGetSingePosting';
import useLanguageOptions from 'tet/admin/hooks/translation/useLanguageOptions';
import useKeywordType from 'tet/admin/hooks/backend/useKeywordType';

const ShowPostingPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, data, error } = useGetSingePosting(id);
  const keywordResult = useKeywordType();
  const languageOptions = useLanguageOptions();

  if (isLoading) {
    return <div>lataa</div>;
  }

  if (error) {
    return <div>virhe</div>;
  }

  if (data) {
    return <PostingContainer posting={eventToTetPosting(data, keywordResult.getKeywordType, languageOptions)} />;
  }

  return <div>jotain</div>;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowPostingPage;
