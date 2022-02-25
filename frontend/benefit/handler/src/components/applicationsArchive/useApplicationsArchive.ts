import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit/handler/types/application';
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

  const list = query.data?.map(
    (application: ApplicationData): ApplicationListItemData => {
      const {
        id = '',
        employee,
        company,
        handled_date,
        application_number: applicationNum,
        status,
      } = application;

      return {
        id,
        status,
        companyName: company ? company.name : '-',
        companyId: company ? company.business_id : '-',
        employeeName:
          getFullName(employee?.first_name, employee?.last_name) || '-',
        handledDate: convertToUIDateFormat(handled_date) || '-',
        dataReceived: '-',
        applicationNum,
      };
    }
  );

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
