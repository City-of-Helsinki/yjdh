import React from 'react';
import PostingSearch from 'tet/youth/components/postingSearch/PostingSearch';
import PostingList from 'tet/youth/components/PostingList/PostingList';
import { useQuery } from 'react-query';
import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';
import { QueryParams } from 'tet/youth/types/queryparams';
import { useRouter } from 'next/router';
import useGetPostings from 'tet/youth/hooks/backend/useGetPostings';

const Postings: React.FC = () => {
  const router = useRouter();

  const params = router.query;

  const { isLoading, data, error } = useGetPostings(params);

  const postings = () => {
    if (isLoading) {
      return <PageLoadingSpinner />;
    }

    if (error) {
      return <div>Virhe datan latauksessa</div>;
    }

    return <PostingList postings={data.data}></PostingList>;
  };

  const searchHandler = (queryParams: QueryParams) => {
    console.log(queryParams, 'queryparams');
    router.push({
      pathname: '/',
      query: {
        ...queryParams,
      },
    });
  };

  return (
    <div>
      <PostingSearch initParams={params} onSearchByFilters={searchHandler}></PostingSearch>
      {postings()}
    </div>
  );
};

export default Postings;
