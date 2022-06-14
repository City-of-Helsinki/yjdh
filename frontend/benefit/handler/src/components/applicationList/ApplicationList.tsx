import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { IconSpeechbubbleText, StatusLabel } from 'hds-react';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import { COLUMN_WIDTH } from 'shared/components/table/constants';
import Table, { Column } from 'shared/components/table/Table';
import { $Link } from 'shared/components/table/Table.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { $CellContent, $Empty, $Heading } from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

type ColumnType = Column<ApplicationListItemData>;

export interface ApplicationListProps {
  heading: string;
  status: APPLICATION_STATUSES[];
}

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

  const columns: ColumnType[] = React.useMemo(() => {
    const cols: ColumnType[] = [
      {
        // eslint-disable-next-line react/display-name
        Cell: ({
          cell: {
            row: {
              original: { id, companyName },
            },
          },
        }) => (
          <$Link
            href={`/application?id=${id}`}
            rel="noopener noreferrer"
            aria-label={companyName}
          >
            {companyName}
          </$Link>
        ),
        Header: getHeader('companyName'),
        accessor: 'companyName',
        width: COLUMN_WIDTH.L,
      },
      {
        Header: getHeader('companyId'),
        accessor: 'companyId',
        disableSortBy: true,
        width: COLUMN_WIDTH.S,
      },
      {
        Header: getHeader('submittedAt'),
        accessor: 'submittedAt',
        disableSortBy: true,
        width: COLUMN_WIDTH.S,
      },
      {
        Header: getHeader('applicationNum'),
        accessor: 'applicationNum',
        disableSortBy: true,
        width: COLUMN_WIDTH.S,
      },
      {
        Header: getHeader('employeeName'),
        accessor: 'employeeName',
        disableSortBy: true,
        width: COLUMN_WIDTH.M,
      },
    ];

    if (status.includes(APPLICATION_STATUSES.HANDLING)) {
      cols.push({
        Header: getHeader('handlerName'),
        accessor: 'handlerName',
        disableSortBy: true,
        width: COLUMN_WIDTH.M,
      });
    }

    if (status.includes(APPLICATION_STATUSES.INFO_REQUIRED)) {
      cols.push({
        // eslint-disable-next-line react/display-name
        Cell: ({
          cell: {
            row: {
              original: { additionalInformationNeededBy, status: itemStatus },
            },
          },
        }) => (
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
        Header: getHeader('additionalInformationNeededBy'),
        accessor: 'additionalInformationNeededBy',
        disableSortBy: true,
      });
    }

    cols.push({
      // eslint-disable-next-line react/display-name
      Cell: ({
        cell: {
          row: {
            original: { unreadMessagesCount },
          },
        },
      }) => (
        <$CellContent>
          {Number(unreadMessagesCount) > 0 ? (
            <IconSpeechbubbleText color={theme.colors.coatOfArms} />
          ) : null}
        </$CellContent>
      ),
      Header: getHeader('unreadMessagesCount'),
      accessor: 'unreadMessagesCount',
      disableSortBy: true,
      width: COLUMN_WIDTH.XS,
    });

    return cols.filter(Boolean);
  }, [t, getHeader, status, theme.colors.coatOfArms]);

  if (shouldShowSkeleton) {
    return (
      <Container>
        <LoadingSkeleton width="100%" height="50px" />
      </Container>
    );
  }

  return (
    <Container>
      <$Heading>{`${heading} (${list.length})`}</$Heading>
      {!shouldHideList ? (
        <Table data={list} columns={columns} />
      ) : (
        <$Empty>{t(`${translationsBase}.messages.empty`)}</$Empty>
      )}
    </Container>
  );
};

export default ApplicationList;
