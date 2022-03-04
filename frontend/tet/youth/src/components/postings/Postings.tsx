import React from 'react';
import PostingSearch from 'tet/youth/components/postingSearch/PostingSearch';
import PostingList from 'tet/youth/components/PostingList/PostingList';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
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

    if (data) {
      return <PostingList postings={data.data}></PostingList>;
    } else {
      //TODO
      return <div>Ei hakutuloksia</div>;
    }
  };

  const searchHandler = (queryParams: QueryParams) => {
    const searchQuery = {
      ...(queryParams.text && queryParams.text.length > 0 && { text: queryParams.text }),
      ...(queryParams.start && queryParams.start.length > 0 && { start: queryParams.start }),
      ...(queryParams.end && queryParams.end.length > 0 && { end: queryParams.end }),
      ...(queryParams.keyword && queryParams.keyword.length > 0 && { keyword: queryParams.keyword }),
      ...(queryParams.language && queryParams.language.length > 0 && { keyword: queryParams.language }),
    };
    router.push(
      {
        pathname: '/postings',
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
