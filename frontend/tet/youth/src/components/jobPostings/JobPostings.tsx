import React from 'react';
import JobPostingSearch from 'tet/youth/components/jobPostingSearch/JobPostingSearch';
import JobPostingList from 'tet/youth/components/jobPostingList/JobPostingList';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import { QueryParams } from 'tet/youth/types/queryparams';
import { useRouter } from 'next/router';
import useGetPostings from 'tet/youth/hooks/backend/useGetPostings';
import NoResults from 'tet/youth/components/noResults/NoResults';

const Postings: React.FC = () => {
  const router = useRouter();
  const initMap = Object.prototype.hasOwnProperty.call(router.query, 'init_map') && Boolean(router.query.init_map);
  const params = { ...router.query };
  delete params['init_map'];
  const results = useGetPostings({ page_size: 10, ...params });
  const all = useGetPostings({ ...params });

  const searchParams = { ...params };
  if (Object.prototype.hasOwnProperty.call(params, 'keyword_AND')) {
    searchParams['keyword'] = searchParams['keyword_AND'];
    delete searchParams['keyword_AND'];
  }

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
      return (
        <JobPostingList
          initMap={initMap}
          firstPostingsPage={results.data}
          allPostings={all}
          hasNextPage={hasNextPage}
        />
      );
    } else {
      //TODO
      return <div>Ei hakutuloksia</div>;
    }
  };

  return (
    <div>
      <JobPostingSearch initParams={searchParams} onSearchByFilters={searchHandler}></JobPostingSearch>
      {postings()}

      {results.isSuccess && (
        <NoResults params={searchParams} onSearchByFilters={searchHandler} resultsTotal={results?.data.meta.count} />
      )}
    </div>
  );
};
export default Postings;
