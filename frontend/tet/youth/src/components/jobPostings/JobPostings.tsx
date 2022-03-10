import React from 'react';
import JobPostingSearch from 'tet/youth/components/jobPostingSearch/JobPostingSearch';
import JobPostingList from 'tet/youth/components/jobPostingList/JobPostingList';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { QueryParams } from 'tet/youth/types/queryparams';
import { useRouter } from 'next/router';
import useGetPostings from 'tet/youth/hooks/backend/useGetPostings';

const Postings: React.FC = () => {
  const router = useRouter();
  const params = router.query;
  const { isLoading, data, error, fetchNextPage, isFetchingNextPage, hasNextPage } = useGetPostings(params);

  const postings = () => {
    if (isLoading) {
      return <PageLoadingSpinner />;
    }

    if (error) {
      //TODO
      return <div>Virhe datan latauksessa</div>;
    }

    if (data) {
      console.log(data, 'data');
      return (
        <JobPostingList
          postings={data}
          isFetchingNextPage={isFetchingNextPage}
          onShowMore={() => fetchNextPage()}
          hasNextPage={hasNextPage}
        />
      );
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
      ...(queryParams.language && queryParams.language.length > 0 && { language: queryParams.language }),
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
      <JobPostingSearch initParams={params} onSearchByFilters={searchHandler}></JobPostingSearch>
      {postings()}
    </div>
  );
};

export default Postings;
