import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

interface ApplicationListProps {
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
}

const useApplicationListData = (
  status: APPLICATION_STATUSES[],
  excludeBatched?: boolean
): ApplicationListProps => {
  const query = useApplicationsQuery(status, '-submitted_at', excludeBatched);

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
        batch,
        application_origin: applicationOrigin,
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
        batch: batch ?? null,
        applicationOrigin,
      };
    }
  );

  const shouldShowSkeleton = query.isLoading;

  const shouldHideList =
    Boolean(query.error) ||
    (!shouldShowSkeleton &&
      Array.isArray(query.data) &&
      query.data.length === 0);

  return {
    list: list || [],
    shouldShowSkeleton,
    shouldHideList,
  };
};

export { useApplicationListData };
