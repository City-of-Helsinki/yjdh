import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { ApplicationData } from 'benefit/applicant/types/application';
import { IconPen } from 'hds-react';
import React from 'react';
import isServerSide from 'shared/server/is-server-side';
import { DefaultTheme } from 'styled-components';

import { ListItemData } from './listItem/ListItem';

const translationListBase = 'common:applications.list.submitted';
const translationStatusBase = 'common:applications.statuses';

interface UseApplicationListArgs {
  data: ApplicationData[];
  isLoading: boolean;
}

interface AllowedAction {
  label: string;
  handler: () => void;
  Icon?: React.FC;
}

interface ApplicationListProps {
  list: ListItemData[];
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

const getInitials = (name: string): string =>
  name
    .match(/(^\S\S?|\b\S)?/g)
    ?.join('')
    .match(/(^\S|\S$)?/g)
    ?.join('') ?? '';

const useApplicationList = ({
  data,
  isLoading,
}: UseApplicationListArgs): ApplicationListProps => {
  const { t } = useTranslation();

  const getStatusTranslation = (
    applicationStatus: APPLICATION_STATUSES
  ): string => {
    switch (applicationStatus) {
      case APPLICATION_STATUSES.APPROVED:
        return t(`${translationStatusBase}.approved`);

      case APPLICATION_STATUSES.DRAFT:
        return t(`${translationStatusBase}.draft`);

      case APPLICATION_STATUSES.INFO_REQUIRED:
        return t(`${translationStatusBase}.infoRequired`);

      case APPLICATION_STATUSES.RECEIVED:
        return t(`${translationStatusBase}.received`);

      case APPLICATION_STATUSES.REJECTED:
        return t(`${translationStatusBase}.rejected`);

      default:
        return applicationStatus;
    }
  };

  const getAllowedActions = (
    applicationStatus: APPLICATION_STATUSES
  ): AllowedAction => {
    switch (applicationStatus) {
      case APPLICATION_STATUSES.DRAFT:
      case APPLICATION_STATUSES.INFO_REQUIRED:
        return {
          label: t(`${translationListBase}.edit`),
          handler: () => {
            // TODO: implement action handler
          },
          Icon: IconPen,
        };

      default:
        return {
          label: t(`${translationListBase}.check`),
          handler: () => {
            // TODO: implement action handler
          },
        };
    }
  };

  const list = data.reduce<ListItemData[]>((acc, application) => {
    const {
      id,
      status,
      employee,
      last_modified_at: modifiedAt,
      submitted_at,
      application_number: applicationNum,
    } = application;

    const statusText = getStatusTranslation(status);
    const name = `${employee.first_name} ${employee.last_name}`;
    const avatar = {
      color: getAvatarBGColor(status),
      initials: getInitials(name),
    };
    const allowedAction = getAllowedActions(status);
    const submittedAt = submitted_at ?? '-';
    const commonProps = { id, name, avatar, modifiedAt, allowedAction };
    const draftProps = { modifiedAt };
    const submittedProps = {
      submittedAt,
      applicationNum,
      statusText,
    };

    if (status === APPLICATION_STATUSES.DRAFT) {
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
    list,
    shouldShowSkeleton,
    shouldHideList,
  };
};

export default useApplicationList;
