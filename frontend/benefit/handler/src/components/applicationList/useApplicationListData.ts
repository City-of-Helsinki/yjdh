import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  AhjoError,
  ApplicationData,
  ApplicationListItemData,
  Instalment,
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

const getHandlerName = (
  calculation: ApplicationData['calculation']
): string => {
  if (calculation?.handler_details) {
    return `${getFullName(
      calculation.handler_details.first_name,
      calculation.handler_details.last_name[0]
    )}.`;
  }
  return '-';
};

const getAhjoError = (
  ahjoError: ApplicationData['ahjo_error']
): AhjoError | undefined => {
  if (ahjoError) {
    return camelcaseKeys(ahjoError, { deep: true }) as unknown as AhjoError;
  }
  return undefined;
};

const getInstalment = (
  instalment: ApplicationData['first_instalment']
): Instalment | undefined => {
  if (instalment) {
    return camelcaseKeys(instalment) as unknown as Instalment;
  }
  return undefined;
};

const transformApplicationData = (
  application: ApplicationData
): ApplicationListItemData => {
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
    first_instalment,
    second_instalment,
    alterations,
  } = application;

  return {
    id,
    status: applicationStatus,
    companyName: company?.name || '-',
    companyId: company?.business_id || '-',
    employeeName: getFullName(employee?.first_name, employee?.last_name) || '-',
    submittedAt: convertToUIDateFormat(submitted_at) || '-',
    modifiedAt: convertToUIDateAndTimeFormat(modified_at) || '-',
    additionalInformationNeededBy:
      convertToUIDateFormat(additional_information_needed_by) || '-',
    applicationNum,
    handlerName: getHandlerName(calculation),
    unreadMessagesCount: unread_messages_count ?? 0,
    batch: batch ?? undefined,
    applicationOrigin,
    talpaStatus: talpa_status,
    ahjoCaseId: ahjo_case_id,
    handledByAhjoAutomation: handled_by_ahjo_automation,
    handledAt: convertToUIDateFormat(handledAt) || '-',
    ahjoError: getAhjoError(ahjo_error),
    decisionDate: convertToUIDateFormat(batch?.decision_date) || '-',
    calculatedBenefitAmount: calculation?.calculated_benefit_amount || '0',
    firstInstalment: getInstalment(first_instalment),
    secondInstalment: getInstalment(second_instalment),
    alterations: alterations || [],
  };
};

const filterApplicationByAhjoMode = (
  application: ApplicationListItemData,
  isNewAhjoMode: boolean
): boolean => {
  if (!application.status) return false;
  if (
    [APPLICATION_STATUSES.DRAFT, APPLICATION_STATUSES.RECEIVED].includes(
      application.status
    )
  ) {
    return true;
  }
  const isHandlingOrInfo = [
    APPLICATION_STATUSES.HANDLING,
    APPLICATION_STATUSES.INFO_REQUIRED,
  ].includes(application.status);
  const isAcceptedOrRejected = [
    APPLICATION_STATUSES.ACCEPTED,
    APPLICATION_STATUSES.REJECTED,
  ].includes(application.status);

  if (isNewAhjoMode) {
    return (
      (isHandlingOrInfo || isAcceptedOrRejected) &&
      !!application.handledByAhjoAutomation
    );
  }
  return (
    (isHandlingOrInfo || isAcceptedOrRejected) &&
    !application.handledByAhjoAutomation
  );
};

const useApplicationListData = (
  status: APPLICATION_STATUSES[],
  excludeBatched?: boolean
): ApplicationListProps => {
  const isNewAhjoMode = useDetermineAhjoMode();
  const query = useApplicationsQuery(status, '-submitted_at', excludeBatched);

  const list = query.data
    ?.map(transformApplicationData)
    .filter((application) =>
      filterApplicationByAhjoMode(application, isNewAhjoMode)
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
