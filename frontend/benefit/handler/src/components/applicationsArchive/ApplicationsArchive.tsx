import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import Fuse from 'fuse.js';
import { LoadingSpinner, Table, TextInput } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $Link } from 'shared/components/table/Table.sc';
import { useTheme } from 'styled-components';

import { $EmptyHeading } from '../applicationList/ApplicationList.sc';
import { $ArchiveCount, $Heading, $Status } from './ApplicationsArchive.sc';
import { useApplicationsArchive } from './useApplicationsArchive';

const ApplicationsArchive: React.FC = () => {
  const {
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationsArchive();
  const theme = useTheme();
  const [filterValue, setFilterValue] = React.useState<string>('');
  const handleChangeSearchValue = (
    e: React.FormEvent<HTMLInputElement>
  ): void => setFilterValue(e.currentTarget.value);
  let filteredList = list;
  const fuse = new Fuse(list, {
    threshold: 0,
    ignoreLocation: true,
    keys: [
      'applicationNum',
      'companyId',
      'employeeName',
      'handledAt',
      'companyName',
    ],
  });
  if (filterValue.length > 1) {
    const fuseList = fuse.search(filterValue);
    filteredList = fuseList.map((item) => item.item);
  }

  interface TableTransforms {
    id?: string;
    companyName?: string;
    status?: APPLICATION_STATUSES;
  }
  const cols = [
    {
      transform: ({ id, companyName }: TableTransforms) => (
        <$Link href={`/application?id=${String(id)}`}>
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
      headerName: getHeader('employeeNameArchive'),
      key: 'employeeName',
      isSortable: true,
    },
    {
      headerName: getHeader('handledAt'),
      key: 'handledAt',
      isSortable: true,
    },
    {
      transform: ({ status }: TableTransforms) => (
        <$Status status={status}>
          {t(`${translationsBase}.columns.statuses.${status}`)?.toString()}
        </$Status>
      ),
      headerName: t(`${translationsBase}.columns.statusArchive`)?.toString(),
      key: 'status',
      isSortable: true,
    },
  ];

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
            id="table-filter"
            label={t('common:search.input.filter.label')}
            placeholder={t('common:search.input.filter.placeholder')}
            onChange={handleChangeSearchValue}
            value={filterValue}
            css="margin-bottom: var(--spacing-m);"
          />
          <Table
            indexKey="id"
            theme={theme.components.table}
            rows={filteredList}
            cols={cols}
          />
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
