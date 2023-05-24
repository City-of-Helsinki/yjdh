import { ApplicationListItemData } from 'benefit-shared/types/application';
import { LoadingSpinner, TextInput } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { COLUMN_WIDTH } from 'shared/components/table/constants';
import Table, { Column } from 'shared/components/table/Table';
import { $Link } from 'shared/components/table/Table.sc';

import { $EmptyHeading } from '../applicationList/ApplicationList.sc';
import { $ArchiveCount, $Heading, $Status } from './ApplicationsArchive.sc';
import { useApplicationsArchive } from './useApplicationsArchive';
import Fuse from 'fuse.js';

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

  const [inputSearchValue, setInputSearchValue] = React.useState('');

  const changeHandler = (e) => setInputSearchValue(e.target.value);

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

  // 2. Set up the Fuse instance
  const fuse = new Fuse(list, {
    threshold: 0,
    keys: [
      'applicationNum',
      'companyId',
      'employeeName',
      'handledAt',
      'companyName',
    ],
  });

  console.log(fuse);

  let filteredList = list;
  // 3. Now search!
  if (inputSearchValue.length) {
    const fuseList = fuse.search(inputSearchValue);
    filteredList = fuseList.map((item) => item.item);
  }
  console.log(filteredList);

  if (shouldShowSkeleton) {
    return (
      <Container>
        <$Heading as="h1">{`${t(
          'common:header.navigation.archive'
        )}`}</$Heading>
        <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
          count: 0,
        })}`}</$ArchiveCount>
        <LoadingSpinner small />
      </Container>
    );
  }

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
        count: filteredList.length,
      })}`}</$ArchiveCount>
      {!shouldHideList ? (
        <>
          <TextInput
            id="filter"
            label="Suodata"
            placeholder="Hakusana"
            onChange={changeHandler}
            value={inputSearchValue}
          />
          <Table data={filteredList} columns={columns} />
        </>
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.archived`)}
        </$EmptyHeading>
      )}
    </Container>
  );
};

export default ApplicationsArchive;
