import { ROUTES } from 'benefit/handler/constants';
import { allApplicationStatuses } from 'benefit/handler/pages';
import {
  ApplicationListTableColumns,
  ApplicationListTableTransforms,
} from 'benefit/handler/types/applicationList';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  IconSpeechbubbleText,
  LoadingSpinner,
  StatusLabel,
  Table,
  Tag,
} from 'hds-react';
import * as React from 'react';
import { $Link } from 'shared/components/table/Table.sc';
import {
  convertToUIDateFormat,
  sortFinnishDate,
} from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { $CellContent, $EmptyHeading, $Heading } from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  status: APPLICATION_STATUSES[];
}

const buildApplicationUrl = (
  id: string,
  status: APPLICATION_STATUSES,
  openDrawer = false
): string => {
  if (status === APPLICATION_STATUSES.DRAFT) {
    return `${ROUTES.APPLICATION_FORM}?id=${id}`;
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
}) => {
  const {
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationList(status);

  const theme = useTheme();

  const isAllStatuses: boolean = status === allApplicationStatuses;

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

    if (status.includes(APPLICATION_STATUSES.HANDLING) && !isAllStatuses) {
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

    if (isAllStatuses) {
      cols.push({
        transform: ({
          status: applicationStatus,
        }: ApplicationListTableTransforms) => (
          <div>
            <Tag>
              {t(
                `common:applications.list.columns.applicationStatuses.${String(
                  applicationStatus
                )}`
              )}
            </Tag>
          </div>
        ),
        headerName: getHeader('applicationStatus'),
        key: 'status',
        isSortable: true,
      });
    }

    if (status.includes(APPLICATION_STATUSES.RECEIVED) && !isAllStatuses) {
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

    if (status.includes(APPLICATION_STATUSES.INFO_REQUIRED) && !isAllStatuses) {
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
  }, [t, getHeader, status, theme, isAllStatuses]);

  if (shouldShowSkeleton) {
    return (
      <>
        {heading && <$Heading>{`${heading}`}</$Heading>}
        <LoadingSpinner small />
      </>
    );
  }

  const statusAsString = isAllStatuses ? 'all' : status.join(',');
  return (
    <div data-testid={`application-list-${statusAsString}`}>
      {!shouldHideList ? (
        <Table
          heading={`${heading} (${list.length})`}
          theme={theme.components.table}
          indexKey="id"
          rows={list}
          cols={columns}
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
