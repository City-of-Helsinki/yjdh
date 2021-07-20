import { APPLICATION_STATUSES, ROUTES } from 'benefit/applicant/constants';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import useApplicationsQuery from 'benefit/applicant/hooks/useApplicationsQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  ApplicationAllowedAction,
  ApplicationListItemData,
} from 'benefit/applicant/types/application';
import { IconPen } from 'hds-react';
import camelCase from 'lodash/camelCase';
import find from 'lodash/find';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import isServerSide from 'shared/server/is-server-side';
import { formatDate } from 'shared/utils/date.utils';
import { getInitials } from 'shared/utils/string.utils';
import { DefaultTheme } from 'styled-components';

const translationListBase = 'common:applications.list.submitted';
const translationStatusBase = 'common:applications.statuses';

interface ApplicationListProps {
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
}

const getAvatarBGColor = (
  status: APPLICATION_STATUSES
): keyof DefaultTheme['colors'] => {
  switch (status) {
    case APPLICATION_STATUSES.DRAFT:
      return 'black40';

    case APPLICATION_STATUSES.INFO_REQUIRED:
      return 'alertDark';

    case APPLICATION_STATUSES.RECEIVED:
      return 'info';

    case APPLICATION_STATUSES.APPROVED:
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

const useApplicationList = (status: string[]): ApplicationListProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, error, isLoading } = useApplicationsQuery(status);
  const { errors, setError } = React.useContext(FrontPageContext);

  useEffect(() => {
    if (error && !find(errors, error)) {
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
    switch (applicationStatus) {
      case APPLICATION_STATUSES.DRAFT:
      case APPLICATION_STATUSES.INFO_REQUIRED:
        return {
          label: t(`${translationListBase}.edit`),
          handleAction: (): void => {
            void router.push(`${ROUTES.APPLICATION_FORM}?id=${id}`);
          },
          Icon: IconPen,
        };

      default:
        return {
          label: t(`${translationListBase}.check`),
          // implement the action
          handleAction: () => noop,
        };
    }
  };

  const list = data?.reduce<ApplicationListItemData[]>((acc, application) => {
    const {
      id = '',
      status: applStatus,
      employee,
      last_modified_at,
      submitted_at,
      application_number: applicationNum,
    } = application;

    const statusText = getStatusTranslation(applStatus);
    const name = getEmployeeFullName(employee?.first_name, employee?.last_name);

    const avatar = {
      color: getAvatarBGColor(applStatus),
      initials: getInitials(name),
    };
    const allowedAction = getAllowedActions(id, applStatus);
    const submittedAt = submitted_at ? formatDate(new Date(submitted_at)) : '-';
    const modifiedAt =
      last_modified_at && formatDate(new Date(last_modified_at));
    const commonProps = { id, name, avatar, modifiedAt, allowedAction };
    const draftProps = { modifiedAt };
    const submittedProps = {
      submittedAt,
      applicationNum,
      statusText,
    };

    if (applStatus === APPLICATION_STATUSES.DRAFT) {
      const newDraftProps = { ...commonProps, ...draftProps };
      return [...acc, newDraftProps];
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
  };
};

export default useApplicationList;
