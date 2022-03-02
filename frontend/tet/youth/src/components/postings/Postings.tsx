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
    const searchQuery = {
      ...(queryParams.text && queryParams.text.length > 0 && { text: queryParams.text }),
      ...(queryParams.start && queryParams.start.length > 0 && { start: queryParams.start }),
      ...(queryParams.end && queryParams.end.length > 0 && { end: queryParams.end }),
      ...(queryParams.keyword && queryParams.keyword.length > 0 && { keyword: queryParams.keyword }),
    };
    router.push(
      {
        pathname: '/',
        query: {
          ...searchQuery,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  return (
    <div>
      <PostingSearch initParams={params} onSearchByFilters={searchHandler}></PostingSearch>
      {postings()}
    </div>
  );
};

export default Postings;
