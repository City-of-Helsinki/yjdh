import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import JobPostingList from 'tet/youth/components/jobPostingList/JobPostingList';
import JobPostingSearch from 'tet/youth/components/jobPostingSearch/JobPostingSearch';
import NoResults from 'tet/youth/components/noResults/NoResults';
import useGetPostings from 'tet/youth/hooks/backend/useGetPostings';
import { QueryParams } from 'tet/youth/types/queryparams';
import ErrorText from 'tet-shared/components/ErrorText/ErrorText';
import ScreenReaderHelper from 'tet-shared/components/ScreenReaderHelper';

const Postings: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const initMap = Object.prototype.hasOwnProperty.call(router.query, 'init_map') && Boolean(router.query.init_map);
  const params = { ...router.query };
  delete params.init_map;
  const results = useGetPostings({ page_size: 10, ...params });
  const all = useGetPostings({ ...params });

  const searchParams = { ...params };
  if (Object.prototype.hasOwnProperty.call(params, 'keyword_AND')) {
    searchParams.keyword = searchParams.keyword_AND;
    delete searchParams.keyword_AND;
  }

  const searchHandler = (queryParams: QueryParams): void => {
    const searchQuery = {
      ...(queryParams.text && queryParams.text.length > 0 && { text: queryParams.text }),
      ...(queryParams.start && queryParams.start.length > 0 && { start: queryParams.start }),
      ...(queryParams.end && queryParams.end.length > 0 && { end: queryParams.end }),
      ...(queryParams.keyword && queryParams.keyword.length > 0 && { keyword_AND: queryParams.keyword }),
      ...(queryParams.language && queryParams.language.length > 0 && { language: queryParams.language }),
    };
    void router.push(
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

  if (results.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (results.error) {
    return <ErrorText>{t('common:postings.resultsError')}</ErrorText>;
  }

  return (
    <div>
      <JobPostingSearch initParams={searchParams} onSearchByFilters={searchHandler} />
      {results.data ? (
        <JobPostingList initMap={initMap} firstPostingsPage={results.data} allPostings={all} />
      ) : (
        <ErrorText>{t('common:postings.resultsError')}</ErrorText>
      )}
      {results.isSuccess && (
        <NoResults params={searchParams} onSearchByFilters={searchHandler} resultsTotal={results?.data.meta.count} />
      )}
      <ScreenReaderHelper aria-live="polite" aria-atomic>
        {results.isLoading ? t('common:accessibility.eventsLoading') : t('common:accessibility.eventsReady')}
      </ScreenReaderHelper>
    </div>
  );
};
export default Postings;
