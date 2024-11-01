import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationData,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { getFullName } from 'shared/utils/application.utils';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';

interface ApplicationListProps {
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
}

const useApplicationListData = (
  status: APPLICATION_STATUSES[],
  excludeBatched?: boolean
): ApplicationListProps => {
  const isNewAhjoMode = useDetermineAhjoMode();
  const query = useApplicationsQuery(status, '-submitted_at', excludeBatched);

  const list = query.data
    ?.map((application: ApplicationData): ApplicationListItemData => {
      const {
        id = '',
        employee,
        company,
        submitted_at,
        modified_at,
        application_number: applicationNum,
        calculation,
        additional_information_needed_by,
        status: applicationStatus,
        unread_messages_count,
        batch,
        talpa_status,
        ahjo_case_id,
        application_origin: applicationOrigin,
        handled_by_ahjo_automation,
        handled_at: handledAt,
        ahjo_error,
        pending_instalment,
      } = application;

      return {
        id,
        status: applicationStatus,
        companyName: company ? company.name : '-',
        companyId: company ? company.business_id : '-',
        employeeName:
          getFullName(employee?.first_name, employee?.last_name) || '-',
        submittedAt: convertToUIDateFormat(submitted_at) || '-',
        modifiedAt: convertToUIDateAndTimeFormat(modified_at) || '-',
        additionalInformationNeededBy:
          convertToUIDateFormat(additional_information_needed_by) || '-',
        applicationNum,
        // refactor when we have handler data
        handlerName:
          `${getFullName(
            calculation?.handler_details?.first_name,
            calculation?.handler_details?.last_name.at(0)
          )}.` || '-',
        unreadMessagesCount: unread_messages_count ?? 0,
        batch: batch ?? null,
        applicationOrigin,
        talpaStatus: talpa_status,
        ahjoCaseId: ahjo_case_id,
        handledByAhjoAutomation: handled_by_ahjo_automation,
        handledAt: convertToUIDateFormat(handledAt) || '-',
        ahjoError: camelcaseKeys(ahjo_error, { deep: true }) || null,
        decisionDate: convertToUIDateFormat(batch?.decision_date) || '-',
        calculatedBenefitAmount: calculation?.calculated_benefit_amount || '0',
        pendingInstalment: camelcaseKeys(pending_instalment),
      };
    })
    .filter(
      (application) =>
        [APPLICATION_STATUSES.DRAFT, APPLICATION_STATUSES.RECEIVED].includes(
          application.status
        ) ||
        ([
          APPLICATION_STATUSES.HANDLING,
          APPLICATION_STATUSES.INFO_REQUIRED,
        ].includes(application.status) &&
          isNewAhjoMode &&
          application.handledByAhjoAutomation) ||
        ([
          APPLICATION_STATUSES.ACCEPTED,
          APPLICATION_STATUSES.REJECTED,
        ].includes(application.status) &&
          isNewAhjoMode &&
          application.handledByAhjoAutomation) ||
        ([
          APPLICATION_STATUSES.HANDLING,
          APPLICATION_STATUSES.INFO_REQUIRED,
        ].includes(application.status) &&
          !isNewAhjoMode &&
          !application.handledByAhjoAutomation) ||
        ([
          APPLICATION_STATUSES.ACCEPTED,
          APPLICATION_STATUSES.REJECTED,
        ].includes(application.status) &&
          !isNewAhjoMode &&
          !application.handledByAhjoAutomation)
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
