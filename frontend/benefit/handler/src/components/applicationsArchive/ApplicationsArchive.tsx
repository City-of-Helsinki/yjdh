import useSearchApplicationQuery from 'benefit/handler/hooks/useSearchApplicationQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  IconCheckCircleFill,
  IconCrossCircleFill,
  LoadingSpinner,
  Table,
  TextInput,
} from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $Link } from 'shared/components/table/Table.sc';
import { sortFinnishDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { $EmptyHeading } from '../applicationList/ApplicationList.sc';
import { $ArchiveCount, $Heading, $Status } from './ApplicationsArchive.sc';
import { prepareData, useApplicationsArchive } from './useApplicationsArchive';

const ApplicationsArchive: React.FC = () => {
  const {
    t,
    list: firstLoadData,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationsArchive();

  const [searchValue, setSearchValue] = React.useState<string>('');
  const {
    data: searchResults,
    isLoading,
    mutate,
  } = useSearchApplicationQuery(searchValue);

  const onSearch = (e: React.FormEvent<HTMLInputElement>): void => {
    setSearchValue(e.currentTarget.value);
    mutate(e.currentTarget.value);
  };
  const theme = useTheme();

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
      customSortCompareFunction: sortFinnishDate,
    },
    {
      transform: ({ status }: TableTransforms) => (
        <$Status status={status}>
          {status === APPLICATION_STATUSES.ACCEPTED ? (
            <IconCheckCircleFill color="var(--color-tram)" />
          ) : null}
          {status === APPLICATION_STATUSES.REJECTED ? (
            <IconCrossCircleFill color="var(--color-brick)" />
          ) : null}
          <span>
            {t(`${translationsBase}.columns.statuses.${status}`)?.toString()}
          </span>
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
        <LoadingSpinner small />
      </Container>
    );
  }

  return (
    <Container data-testid="application-list-archived">
      <$Heading as="h1" data-testid="main-ingress">{`${t(
        'common:header.navigation.archive'
      )}`}</$Heading>
      {!shouldHideList ? (
        <>
          <TextInput
            id="table-filter"
            label={t('common:search.input.filter.label')}
            placeholder={t('common:search.input.filter.placeholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            onKeyUp={(e) =>
              e.key.toLowerCase() === 'enter' ? onSearch(e) : null
            }
            css="margin-bottom: var(--spacing-m);"
          />
          {/* }
          <TextInput
            id="table-filter"
            label={t('common:search.input.filter.label')}
            placeholder={t('common:search.input.filter.placeholder')}
            onChange={onSearch}
            value={filterValue}
            css="margin-bottom: var(--spacing-m);"
          />
          { */}

          {isLoading && <LoadingSpinner />}

          {!isLoading && firstLoadData.length > 0 && !searchResults && (
            <>
              <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
                count: firstLoadData.length || 0,
              })}`}</$ArchiveCount>
              <Table
                indexKey="id"
                theme={theme.components.table}
                rows={firstLoadData || []}
                cols={cols}
              />
            </>
          )}

          {!isLoading && searchResults?.data.length > 0 && (
            <Table
              indexKey="id"
              theme={theme.components.table}
              rows={
                searchResults && searchResults.data
                  ? prepareData(searchResults?.data)
                  : []
              }
              cols={cols}
            />
          )}

          <div style={{ margin: '40px 0' }}>
            <code>{JSON.stringify(searchResults, null, '\t')}</code>
          </div>
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
