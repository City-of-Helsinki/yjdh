import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { getBatchDataReceived } from 'benefit/handler/utils/common';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import isServerSide from 'shared/server/is-server-side';
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

const useApplicationsArchive = (): ApplicationListProps => {
  const { t } = useTranslation();
  const query = useApplicationsQuery(['accepted', 'rejected', 'cancelled']);

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
        status,
        batch,
      } = application;

      return {
        id,
        status,
        companyName: company ? company.name : '-',
        companyId: company ? company.business_id : '-',
        employeeName:
          getFullName(employee?.first_name, employee?.last_name) || '-',
        handledAt: convertToUIDateFormat(handled_at) || '-',
        dataReceived: getBatchDataReceived(status, batch?.created_at),
        applicationNum,
      };
    });

  const shouldShowSkeleton = !isServerSide() && query.isLoading;

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
