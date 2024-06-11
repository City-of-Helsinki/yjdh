import useSearchApplicationQuery from 'benefit/handler/hooks/useSearchApplicationQuery';
import { SearchResponse } from 'benefit/handler/types/search';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { getFullNameListing } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

interface ApplicationListProps {
  t: TFunction;
  searchResults: SearchResponse;
  isSearchLoading: boolean;
  shouldHideList: boolean;
  submitSearch: (value: string) => void;
}

export const prepareSearchData = (
  data: ApplicationData[]
): ApplicationListItemData[] =>
  data
    ? data
        .sort(
          (a: ApplicationData, b: ApplicationData): number =>
            Date.parse(b.handled_at ?? '') - Date.parse(a.handled_at ?? '')
        )
        .map((application: ApplicationData): ApplicationListItemData => {
          const {
            id = '',
            employee,
            company,
            handled_at,
            application_number: applicationNum,
            status,
            calculation,
          } = application;

          return {
            id,
            status,
            companyName: company ? company.name : '-',
            companyId: company ? company.business_id : '-',
            employeeName:
              getFullNameListing(employee?.first_name, employee?.last_name) ||
              '-',
            handledAt: convertToUIDateFormat(handled_at) || '-',
            applicationNum,
            calculationEndDate:
              convertToUIDateFormat(calculation?.end_date) || '-',
          };
        })
    : [];

const useApplicationsArchive = (
  searchString: string,
  archived: boolean,
  includeArchivalApplications: boolean,
  subsidyInEffect: number,
  decisionRange: number
): ApplicationListProps => {
  const { t } = useTranslation();

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error,
    mutate: getSearchResults,
  } = useSearchApplicationQuery(
    searchString,
    archived,
    includeArchivalApplications,
    subsidyInEffect,
    decisionRange
  );

  useEffect(() => {
    getSearchResults('');
  }, [getSearchResults]);

  const shouldHideList =
    Boolean(error) || (!isSearchLoading && searchResults?.matches.length === 0);

  return {
    t,
    searchResults,
    isSearchLoading,
    shouldHideList,
    submitSearch: (value: string) => getSearchResults(value),
  };
};

export { useApplicationsArchive };
