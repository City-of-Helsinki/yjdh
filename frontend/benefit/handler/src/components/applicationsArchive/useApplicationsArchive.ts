import useSearchApplicationQuery from 'benefit/handler/hooks/useSearchApplicationQuery';
import { SearchResponse } from 'benefit/handler/types/search';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { getFullNameListing } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

export enum FILTER_SELECTION {
  SUBSIDY_IN_EFFECT_RANGE_THREE_YEARS = 1,
  SUBSIDY_IN_EFFECT_NOW = 2,
  DECISION_RANGE_THREE_YEARS = 3,
  NO_FILTER = 4,
}

export enum SUBSIDY_IN_EFFECT {
  RANGE_THREE_YEARS = 3,
  RANGE_NOW = 'now',
}

export enum DECISION_RANGE {
  RANGE_THREE_YEARS = 3,
}
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
            alterations,
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
            alterations,
            calculationEndDate: [
              APPLICATION_STATUSES.ACCEPTED,
              APPLICATION_STATUSES.ARCHIVAL,
            ].includes(status)
              ? convertToUIDateFormat(calculation?.end_date) || '-'
              : '-',
          };
        })
    : [];

const useApplicationsArchive = (
  searchString: string,
  archived: boolean,
  includeArchivalApplications: boolean,
  subsidyInEffect: SUBSIDY_IN_EFFECT,
  decisionRange: number,
  applicationNum?: string
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
    decisionRange,
    applicationNum
  );

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
