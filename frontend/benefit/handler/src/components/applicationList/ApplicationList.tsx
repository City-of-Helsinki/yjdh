import { ALL_APPLICATION_STATUSES, ROUTES } from 'benefit/handler/constants';
import {
  ApplicationListTableColumns,
  ApplicationListTableTransforms,
} from 'benefit/handler/types/applicationList';
import { getTagStyleForStatus } from 'benefit/handler/utils/applications';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { IconSpeechbubbleText, StatusLabel, Table, Tag } from 'hds-react';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $Link } from 'shared/components/table/Table.sc';
import {
  convertToUIDateFormat,
  sortFinnishDate,
  sortFinnishDateTime,
} from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import {
  $CellContent,
  $EmptyHeading,
  $Heading,
  $TagWrapper,
} from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  status: APPLICATION_STATUSES[];
  list?: ApplicationListItemData[];
  isLoading: boolean;
}

const buildApplicationUrl = (
  id: string,
  status: APPLICATION_STATUSES,
  openDrawer = false
): string => {
  if (status === APPLICATION_STATUSES.DRAFT) {
    return `${ROUTES.APPLICATION_FORM_NEW}?id=${id}`;
  }

  const applicationUrl = `${ROUTES.APPLICATION}?id=${id}`;
  if (openDrawer) {
    return `${applicationUrl}&openDrawer=1`;
  }
  return applicationUrl;
};

const ApplicationList: React.FC<ApplicationListProps> = ({
  heading,
  status,
  list = [],
  isLoading = true,
}) => {
  const { t, translationsBase, getHeader } = useApplicationList();
  const theme = useTheme();

  const isAllStatuses: boolean = status === ALL_APPLICATION_STATUSES;
  const isVisibleOnlyForStatus = React.useMemo(
    () => ({
      draft: status.includes(APPLICATION_STATUSES.DRAFT) && !isAllStatuses,
      received:
        status.includes(APPLICATION_STATUSES.RECEIVED) && !isAllStatuses,
      handling:
        status.includes(APPLICATION_STATUSES.HANDLING) && !isAllStatuses,
      infoRequired:
        status.includes(APPLICATION_STATUSES.INFO_REQUIRED) && !isAllStatuses,
      accepted:
        status.includes(APPLICATION_STATUSES.ACCEPTED) && !isAllStatuses,
      rejected:
        status.includes(APPLICATION_STATUSES.REJECTED) && !isAllStatuses,
    }),
    [isAllStatuses, status]
  );

  const columns = React.useMemo(() => {
    const cols: ApplicationListTableColumns[] = [
      {
        transform: ({
          id,
          companyName,
          unreadMessagesCount,
          status: applicationStatus,
        }: ApplicationListTableTransforms) => (
          <$Link
            href={buildApplicationUrl(
              id,
              applicationStatus,
              unreadMessagesCount > 0
            )}
          >
            {String(companyName)}
          </$Link>
        ),
        headerName: getHeader('companyName'),
        key: 'companyName',
        isSortable: true,
      },
      {
        headerName: getHeader('companyId'),
        key: 'companyId',
        isSortable: true,
      },
      {
        headerName: getHeader('applicationNum'),
        key: 'applicationNum',
        isSortable: true,
      },
      {
        headerName: getHeader('employeeName'),
        key: 'employeeName',
        isSortable: true,
      },
    ];

    if (isVisibleOnlyForStatus.handling) {
      cols.push({
        headerName: getHeader('handlerName'),
        key: 'handlerName',
        isSortable: true,
      });
    }

    if (!status.includes(APPLICATION_STATUSES.DRAFT) || isAllStatuses) {
      cols.push({
        headerName: getHeader('submittedAt'),
        key: 'submittedAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
      });
    }

    if (isVisibleOnlyForStatus.draft) {
      cols.push({
        headerName: getHeader('modifiedAt'),
        key: 'modifiedAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDateTime,
      });
    }

    if (
      isVisibleOnlyForStatus.accepted ||
      isVisibleOnlyForStatus.rejected ||
      isAllStatuses
    ) {
      cols.push({
        transform: ({
          status: applicationStatus,
        }: ApplicationListTableTransforms) => (
          <$TagWrapper $colors={getTagStyleForStatus(applicationStatus)}>
            <Tag>
              {t(
                `common:applications.list.columns.applicationStatuses.${String(
                  applicationStatus
                )}`
              )}
            </Tag>
          </$TagWrapper>
        ),
        headerName: getHeader('applicationStatus'),
        key: 'status',
        isSortable: true,
      });
    }

    if (isVisibleOnlyForStatus.received) {
      cols.push({
        transform: ({ applicationOrigin }: ApplicationListTableTransforms) => (
          <div>
            <Tag>
              {t(
                `common:applications.list.columns.applicationOrigins.${String(
                  applicationOrigin
                )}`
              )}
            </Tag>
          </div>
        ),
        headerName: getHeader('origin'),
        key: 'applicationOrigin',
        isSortable: true,
      });
    }

    if (isVisibleOnlyForStatus.infoRequired) {
      cols.push({
        transform: ({
          additionalInformationNeededBy,
          status: itemStatus,
        }: ApplicationListTableTransforms) => (
          <div>
            {itemStatus === APPLICATION_STATUSES.INFO_REQUIRED ? (
              <StatusLabel type="alert">
                {t(
                  `common:applications.list.columns.additionalInformationNeededByVal`,
                  {
                    date: convertToUIDateFormat(additionalInformationNeededBy),
                  }
                )}
              </StatusLabel>
            ) : null}
          </div>
        ),
        headerName: getHeader('additionalInformationNeededBy'),
        key: 'additionalInformationNeededBy',
        isSortable: false,
      });
    }

    cols.push({
      transform: ({
        unreadMessagesCount,
        id,
        status: applicationStatus,
      }: ApplicationListTableTransforms) => (
        <$CellContent>
          {Number(unreadMessagesCount) > 0 ? (
            <$Link href={buildApplicationUrl(id, applicationStatus, true)}>
              <IconSpeechbubbleText color={theme.colors.coatOfArms} />
            </$Link>
          ) : null}
        </$CellContent>
      ),
      headerName: getHeader('unreadMessagesCount'),
      key: 'unreadMessagesCount',
      isSortable: false,
    });

    return cols.filter(Boolean);
  }, [t, getHeader, status, theme, isAllStatuses, isVisibleOnlyForStatus]);

  if (isLoading) {
    return (
      <>
        {heading && (
          <$Heading
            css={{ marginBottom: theme.spacing.xs }}
          >{`${heading}`}</$Heading>
        )}
        <LoadingSkeleton
          borderRadius={0}
          baseColor={theme.colors.fog}
          height={50}
        />
        <LoadingSkeleton height={67} />
      </>
    );
  }

  const statusAsString = isAllStatuses ? 'all' : status.join(',');

  return (
    <div data-testid={`application-list-${statusAsString}`}>
      {list.length > 0 ? (
        <Table
          heading={`${heading} (${list.length})`}
          theme={theme.components.table}
          indexKey="id"
          rows={list}
          cols={columns}
          zebra
        />
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.${statusAsString}`)}
        </$EmptyHeading>
      )}
    </div>
  );
};

export default ApplicationList;
