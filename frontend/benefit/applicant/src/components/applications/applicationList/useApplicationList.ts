import { ROUTES } from 'benefit/applicant/constants';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import useApplicationsQuery from 'benefit/applicant/hooks/useApplicationsQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationAllowedAction,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import {
  IconAlertCircleFill,
  IconCheckCircle,
  IconCheckCircleFill,
  IconCrossCircleFill,
  IconPen,
} from 'hds-react';
import camelCase from 'lodash/camelCase';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import isServerSide from 'shared/server/is-server-side';
import { OptionType } from 'shared/types/common';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';
import { getInitials } from 'shared/utils/string.utils';
import { DefaultTheme } from 'styled-components';

const translationListBase = 'common:applications.list';
const translationStatusBase = 'common:applications.statuses';

interface Props {
  status: string[];
  isArchived?: boolean;
  orderByOptions?: OptionType[];
}

export interface ApplicationListProps {
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  t: TFunction;
  orderBy: OptionType;
  setOrderBy: (option: OptionType) => void;
  language: Language;
  hasItems: boolean;
}

const getAvatarBGColor = (
  status: APPLICATION_STATUSES
): keyof DefaultTheme['colors'] => {
  switch (status) {
    case APPLICATION_STATUSES.DRAFT:
      return 'black60';

    case APPLICATION_STATUSES.INFO_REQUIRED:
      return 'alert';

    case APPLICATION_STATUSES.RECEIVED:
      return 'info';

    case APPLICATION_STATUSES.ACCEPTED:
      return 'success';

    case APPLICATION_STATUSES.REJECTED:
      return 'error';

    default:
      return 'black40';
  }
};

const getEmployeeFullName = (firstName: string, lastName: string): string => {
  const name = `${firstName || ''} ${lastName || ''}`;
  return name === ' ' ? '-' : name;
};

const useApplicationList = ({
  status,
  isArchived,
  orderByOptions,
}: Props): ApplicationListProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const [orderBy, setOrderBy] = useState<OptionType>(
    orderByOptions?.[0] || {
      label: 'common:sortOrder.submittedAt.desc',
      value: '-submitted_at',
    }
  );
  const language = useLocale();

  const { data, error, isLoading } = useApplicationsQuery({
    status,
    isArchived,
    orderBy: orderBy.value.toString(),
  });

  const { errors, setError } = React.useContext(FrontPageContext);

  useEffect(() => {
    if (error && !errors.includes(error)) {
      setError(error);
    }
  }, [errors, error, setError]);

  const getStatusTranslation = (
    applicationStatus: APPLICATION_STATUSES,
    values: Record<string, string>
  ): string =>
    t(`${translationStatusBase}.${camelCase(applicationStatus)}`, values);

  const getStatusIcon = (applicationStatus: APPLICATION_STATUSES): React.FC => {
    switch (applicationStatus) {
      case APPLICATION_STATUSES.DRAFT:
        return () => React.createElement('span');

      case APPLICATION_STATUSES.INFO_REQUIRED:
        return IconAlertCircleFill;

      case APPLICATION_STATUSES.RECEIVED:
        return IconCheckCircle;

      case APPLICATION_STATUSES.ACCEPTED:
        return IconCheckCircleFill;

      case APPLICATION_STATUSES.REJECTED:
        return IconCrossCircleFill;

      case APPLICATION_STATUSES.CANCELLED:
        return IconCrossCircleFill;

      case APPLICATION_STATUSES.HANDLING:
        return IconCheckCircle;

      default:
        return () => React.createElement('span');
    }
  };
  const getAllowedActions = (
    id: string,
    applicationStatus: APPLICATION_STATUSES
  ): ApplicationAllowedAction => {
    const handleAction = (openDrawer: boolean): void => {
      void router.push(
        `${ROUTES.APPLICATION_FORM}?id=${id}${
          openDrawer ? '&openDrawer=1' : ''
        }`
      );
    };

    switch (applicationStatus) {
      case APPLICATION_STATUSES.DRAFT:
      case APPLICATION_STATUSES.INFO_REQUIRED:
        return {
          label: t(`${translationListBase}.common.edit`),
          handleAction,
          Icon: IconPen,
        };

      default:
        return {
          label: t(`${translationListBase}.common.check`),
          handleAction,
        };
    }
  };

  const list = data?.reduce<ApplicationListItemData[]>((acc, application) => {
    const {
      id = '',
      status: appStatus,
      employee,
      modified_at,
      submitted_at,
      application_number: applicationNum,
      additional_information_needed_by,
      unread_messages_count,
      batch,
      end_date,
      company_contact_person_first_name,
      company_contact_person_last_name,
    } = application;

    const employeeName = getEmployeeFullName(
      employee?.first_name,
      employee?.last_name
    );
    const contactPersonName = getEmployeeFullName(
      company_contact_person_first_name,
      company_contact_person_last_name
    );

    const avatar = {
      color: getAvatarBGColor(appStatus),
      initials: getInitials(contactPersonName),
    };
    const allowedAction = getAllowedActions(id, appStatus);
    const submittedAt = submitted_at
      ? convertToUIDateFormat(submitted_at)
      : '-';
    const modifiedAtWithTime =
      modified_at && convertToUIDateAndTimeFormat(modified_at);
    const endDate = end_date && convertToUIDateFormat(end_date);
    const editEndDate =
      additional_information_needed_by &&
      convertToUIDateFormat(additional_information_needed_by);
    const translationValues: Record<string, string> = {};

    if (appStatus === APPLICATION_STATUSES.INFO_REQUIRED) {
      translationValues.date = editEndDate;
    }

    const statusText = getStatusTranslation(appStatus, translationValues);

    const commonProps = {
      id,
      name: employeeName,
      avatar,
      applicationNum,
      allowedAction,
      status: appStatus,
      unreadMessagesCount: unread_messages_count ?? 0,
      batch,
      statusIcon: getStatusIcon(appStatus),
      contactPersonName,
    };
    const draftProps = { modifiedAt: modifiedAtWithTime };
    const submittedProps = {
      submittedAt,
      statusText,
      validUntil: appStatus === APPLICATION_STATUSES.ACCEPTED ? endDate : null,
    };
    const infoNeededProps = {
      submittedAt,
      statusText,
    };

    if (appStatus === APPLICATION_STATUSES.DRAFT) {
      const newDraftProps = { ...commonProps, ...draftProps };
      return [...acc, newDraftProps];
    }
    if (appStatus === APPLICATION_STATUSES.INFO_REQUIRED) {
      const newInfoNeededProps = { ...commonProps, ...infoNeededProps };
      return [...acc, newInfoNeededProps];
    }
    const newSubmittedProps = { ...commonProps, ...submittedProps };
    return [...acc, newSubmittedProps];
  }, []);

  const shouldShowSkeleton = !isServerSide() && isLoading;

  const shouldHideList =
    !shouldShowSkeleton && Array.isArray(data) && data.length === 0;

  const hasItems = list?.length > 0;

  return {
    list: list || [],
    shouldShowSkeleton,
    shouldHideList,
    t,
    orderBy,
    setOrderBy,
    language,
    hasItems,
  };
};

export default useApplicationList;
