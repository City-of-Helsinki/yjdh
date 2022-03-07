import type { NextPage } from 'next';
import React from 'react';
import { GetStaticProps } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { TetEvent } from 'tet/admin/types/linkedevents';
import { singleEvent } from 'tet/youth/backend-api/backend-api';
import PostingContainer from 'tet/shared/src/components/posting/PostingContainer';
import { eventToTetPosting } from 'tet/admin/backend-api/transformations';

const ShowPostingPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  console.log(id, singleEvent(id));
  const { isLoading, data, error } = useQuery<TetEvent>(singleEvent(id));

  if (isLoading || error) {
    return <div>virhe</div>;
  }

  if (data) {
    return <PostingContainer posting={eventToTetPosting(data)} />;
  }

  return <div>jotain</div>;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default ShowPostingPage;
