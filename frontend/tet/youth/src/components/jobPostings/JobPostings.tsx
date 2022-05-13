import React from 'react';
import JobPostingSearch from 'tet/youth/components/jobPostingSearch/JobPostingSearch';
import JobPostingList from 'tet/youth/components/jobPostingList/JobPostingList';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { QueryParams } from 'tet/youth/types/queryparams';
import { useRouter } from 'next/router';
import useGetPostings from 'tet/youth/hooks/backend/useGetPostings';
import { getEvents, getWorkFeatures } from 'tet-shared/backend-api/linked-events-api';
import { useQueries, useQuery } from 'react-query';

const Postings: React.FC = () => {
  const router = useRouter();
  const params = router.query;
  const results = useGetPostings({ page_size: 10, ...params });
  const all = useGetPostings({ ...params });

  const postings = () => {
    const hasNextPage = false;
    if (results.isLoading) {
      return <PageLoadingSpinner />;
    }

    if (results.error) {
      //TODO
      return <div>Virhe datan latauksessa</div>;
    }

    if (results.data) {
      return <JobPostingList postings={results.data} everyPosting={all} hasNextPage={hasNextPage} />;
    } else {
      //TODO
      return <div>Ei hakutuloksia</div>;
    }
  };
  console.log(results);

  const searchHandler = (queryParams: QueryParams) => {
    const searchQuery = {
      ...(queryParams.text && queryParams.text.length > 0 && { text: queryParams.text }),
      ...(queryParams.start && queryParams.start.length > 0 && { start: queryParams.start }),
      ...(queryParams.end && queryParams.end.length > 0 && { end: queryParams.end }),
      ...(queryParams.keyword && queryParams.keyword.length > 0 && { ['keyword_AND']: queryParams.keyword }),
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

  const searchParams = { ...params };
  if (Object.prototype.hasOwnProperty.call(params, 'keyword_AND')) {
    searchParams['keyword'] = searchParams['keyword_AND'];
    delete searchParams['keyword_AND'];
  }

  return (
    <div>
      <JobPostingSearch initParams={searchParams} onSearchByFilters={searchHandler}></JobPostingSearch>
      {postings()}
    </div>
  );
};
export default Postings;
