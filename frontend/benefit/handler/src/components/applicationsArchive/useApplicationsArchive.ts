import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { getBatchDataReceived } from 'benefit/handler/utils/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { getFullNameListing } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

interface ApplicationListProps {
  t: TFunction;
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  getHeader: (id: string) => string;
  translationsBase: string;
}

const translationsBase = 'common:applications.list';

export const prepareData = (
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
            batch,
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
            dataReceived: getBatchDataReceived(status, batch?.created_at),
            applicationNum,
            batch: batch ?? null,
          };
        })
    : [];

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
            calculationEndDate: calculation?.end_date || '-',
          };
        })
    : [];

const useApplicationsArchive = (): ApplicationListProps => {
  const { t } = useTranslation();
  const query = useApplicationsQuery(
    [
      APPLICATION_STATUSES.ACCEPTED,
      APPLICATION_STATUSES.REJECTED,
      APPLICATION_STATUSES.CANCELLED,
    ],
    '-handled_at',
    false,
    true
  );

  const list = prepareData(query?.data);

  const shouldShowSkeleton = query.isLoading;

  const shouldHideList =
    Boolean(query.error) ||
    (!shouldShowSkeleton &&
      Array.isArray(query.data) &&
      query.data.length === 0);

  const getHeader = (id: string): string =>
    t(`${translationsBase}.columns.${id}`);

  return {
    t,
    list: list || [],
    shouldShowSkeleton,
    shouldHideList,
    getHeader,
    translationsBase,
  };
};

export { useApplicationsArchive };
