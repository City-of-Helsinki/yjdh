import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { ApplicationListItemData } from 'benefit/handler/types/application';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import Table, { Column, COLUMN_WIDTH } from 'shared/components/table/Table';
import { $Link } from 'shared/components/table/Table.sc';

import { $Empty, $Heading } from './ApplicationList.sc';
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

  const rawColumns: (ColumnType | undefined)[] = [
    {
      // eslint-disable-next-line react/display-name
      Cell: ({
        cell: {
          row: {
            original: { companyName },
          },
        },
      }) => <$Link>{companyName}</$Link>,
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

  if (status.includes(APPLICATION_STATUSES.RECEIVED)) {
    rawColumns.push({
      Header: getHeader('handlerName'),
      accessor: 'handlerName',
      disableSortBy: true,
      width: COLUMN_WIDTH.M,
    });
  }

  const columns: ColumnType[] = rawColumns.filter(
    (column): column is ColumnType => column !== undefined
  );

  if (shouldShowSkeleton) {
    return (
      <Container>
        <LoadingSkeleton width="150px" height="50px" />
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
