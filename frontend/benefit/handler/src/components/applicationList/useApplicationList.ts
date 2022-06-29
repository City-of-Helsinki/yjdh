import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
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

const useApplicationList = (
  status: APPLICATION_STATUSES[]
): ApplicationListProps => {
  const { t } = useTranslation();
  const query = useApplicationsQuery(status);

  const list = query.data?.map(
    (application: ApplicationData): ApplicationListItemData => {
      const {
        id = '',
        employee,
        company,
        submitted_at,
        application_number: applicationNum,
        calculation,
        additional_information_needed_by,
        status: applicationStatus,
        unread_messages_count,
      } = application;

      return {
        id,
        status: applicationStatus,
        companyName: company ? company.name : '-',
        companyId: company ? company.business_id : '-',
        employeeName:
          getFullName(employee?.first_name, employee?.last_name) || '-',
        submittedAt: convertToUIDateFormat(submitted_at) || '-',
        additionalInformationNeededBy:
          convertToUIDateFormat(additional_information_needed_by) || '-',
        applicationNum,
        // refactor when we have handler data
        handlerName:
          getFullName(
            calculation?.handler_details?.first_name,
            calculation?.handler_details?.last_name
          ) || '-',
        unreadMessagesCount: unread_messages_count ?? 0,
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

export { useApplicationList };
