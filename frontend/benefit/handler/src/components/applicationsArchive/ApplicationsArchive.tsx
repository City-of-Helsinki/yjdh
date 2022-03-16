import { ApplicationListItemData } from 'benefit/handler/types/application';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import { COLUMN_WIDTH } from 'shared/components/table/constants';
import Table, { Column } from 'shared/components/table/Table';
import { $Link } from 'shared/components/table/Table.sc';

import {
  $ArchiveCount,
  $Empty,
  $Heading,
  $Status,
} from './ApplicationsArchive.sc';
import { useApplicationsArchive } from './useApplicationsArchive';

type ColumnType = Column<ApplicationListItemData>;

const ApplicationsArchive: React.FC = () => {
  const {
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationsArchive();

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
        width: COLUMN_WIDTH.XL,
        disableSortBy: true,
      },
      {
        Header: getHeader('companyId'),
        accessor: 'companyId',
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
        Header: t(
          `${translationsBase}.columns.employeeNameArchive`
        )?.toString(),
        accessor: 'employeeName',
        disableSortBy: true,
        width: COLUMN_WIDTH.M,
      },
      {
        Header: getHeader('handledAt'),
        accessor: 'handledAt',
        disableSortBy: true,
        width: COLUMN_WIDTH.S,
      },
      {
        Header: getHeader('dataReceived'),
        accessor: 'dataReceived',
        disableSortBy: true,
        width: COLUMN_WIDTH.S,
      },
      {
        // eslint-disable-next-line react/display-name
        Cell: ({
          cell: {
            row: {
              original: { status },
            },
          },
        }) => (
          <$Status status={status}>
            {t(`${translationsBase}.columns.statuses.${status}`)?.toString()}
          </$Status>
        ),
        Header: t(`${translationsBase}.columns.statusArchive`)?.toString(),
        accessor: 'status',
        width: COLUMN_WIDTH.L,
        disableSortBy: true,
      },
    ];
    return cols.filter(Boolean);
  }, [t, getHeader, translationsBase]);

  if (shouldShowSkeleton) {
    return (
      <Container>
        <LoadingSkeleton width="100%" height="50px" />
      </Container>
    );
  }

  const sortBy = React.useMemo(
    () => [
      {
        id: 'handledAt',
        desc: true,
      },
    ],
    []
  );

  return (
    <Container>
      <$Heading>{`${t('common:header.navigation.archive')}`}</$Heading>
      {list.length > 0 && (
        <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
          count: list.length,
        })}`}</$ArchiveCount>
      )}
      {!shouldHideList ? (
        <Table data={list} columns={columns} sortBy={sortBy} />
      ) : (
        <$Empty>{t(`${translationsBase}.messages.empty`)}</$Empty>
      )}
    </Container>
  );
};

export default ApplicationsArchive;
