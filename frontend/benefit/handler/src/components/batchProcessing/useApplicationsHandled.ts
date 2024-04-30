import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { getBatchDataReceived } from 'benefit/handler/utils/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { getFullName } from 'shared/utils/application.utils';
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

const useApplicationsHandled = (
  status: APPLICATION_STATUSES,
  excludeBatched = false
): ApplicationListProps => {
  const { t } = useTranslation();
  const query = useApplicationsQuery([status], '-submitted_at', excludeBatched);

  const list = query.data
    ?.sort(
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
        status: appStatus,
        batch,
        talpa_status,
      } = application;

      return {
        id,
        status: appStatus,
        batch,
        companyName: company ? company.name : '-',
        companyId: company ? company.business_id : '-',
        employeeName:
          getFullName(employee?.first_name, employee?.last_name) || '-',
        handledAt: convertToUIDateFormat(handled_at) || '-',
        dataReceived: getBatchDataReceived(status, batch?.created_at),
        applicationNum,
        talpaStatus: talpa_status,
      };
    });

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

export { useApplicationsHandled };
