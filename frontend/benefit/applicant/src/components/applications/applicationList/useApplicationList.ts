import { ROUTES } from 'benefit/applicant/constants';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import useApplicationsQuery from 'benefit/applicant/hooks/useApplicationsQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationAllowedAction,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import { IconPen } from 'hds-react';
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
  initialPage?: number;
  orderByOptions?: OptionType[];
}

interface ApplicationListProps {
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  currentPage: number | null;
  setPage: (newPage: number | null) => void;
  t: TFunction;
  orderBy: OptionType;
  setOrderBy: (option: OptionType) => void;
  language: Language;
}

const getAvatarBGColor = (
  status: APPLICATION_STATUSES
): keyof DefaultTheme['colors'] => {
  switch (status) {
    case APPLICATION_STATUSES.DRAFT:
      return 'black40';

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
  initialPage,
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
  const [currentPage, setPage] = useState<number | null>(initialPage ?? null);

  useEffect(() => {
    if (error && !errors.includes(error)) {
      setError(error);
    }
  }, [errors, error, setError]);

  const getStatusTranslation = (
    applicationStatus: APPLICATION_STATUSES
  ): string => t(`${translationStatusBase}.${camelCase(applicationStatus)}`);

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
    } = application;

    const statusText = getStatusTranslation(appStatus);
    const name = getEmployeeFullName(employee?.first_name, employee?.last_name);

    const avatar = {
      color: getAvatarBGColor(appStatus),
      initials: getInitials(name),
    };
    const allowedAction = getAllowedActions(id, appStatus);
    const submittedAt = submitted_at
      ? convertToUIDateFormat(submitted_at)
      : '-';
    const modifiedAtWithTime =
      modified_at && convertToUIDateAndTimeFormat(modified_at);
    const modifiedAt = modified_at && convertToUIDateFormat(modified_at);
    const editEndDate =
      additional_information_needed_by &&
      convertToUIDateFormat(additional_information_needed_by);
    const commonProps = {
      id,
      name,
      avatar,
      modifiedAt,
      allowedAction,
      status: appStatus,
      unreadMessagesCount: unread_messages_count ?? 0,
      batch,
    };
    const draftProps = { modifiedAt: modifiedAtWithTime, applicationNum };
    const submittedProps = {
      submittedAt,
      applicationNum,
      statusText,
    };
    const infoNeededProps = {
      submittedAt,
      applicationNum,
      editEndDate,
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

  return {
    list: list || [],
    shouldShowSkeleton,
    shouldHideList,
    currentPage,
    setPage,
    t,
    orderBy,
    setOrderBy,
    language,
  };
};

export default useApplicationList;
