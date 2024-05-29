import { getTagStyleForStatus } from 'benefit/handler/utils/applications';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { IconAlertCircle, IconCheck, IconCross, Table, Tag } from 'hds-react';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $Link } from 'shared/components/table/Table.sc';
import { sortFinnishDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { $TagWrapper } from '../applicationList/ApplicationList.sc';
import { $ArchiveCount } from './ApplicationsArchive.sc';
import {
  prepareSearchData,
  useApplicationsArchive,
} from './useApplicationsArchive';

type SearchProps = {
  data: ApplicationData[];
  isSearchLoading: boolean;
  submittedSearchString: string;
  searchString: string;
};

const STATUS_SORT_RANK = {
  [APPLICATION_STATUSES.ACCEPTED]: 1,
  [APPLICATION_STATUSES.REJECTED]: 0,
  [APPLICATION_STATUSES.CANCELLED]: -1,
};

const sortByStatus = (
  a: APPLICATION_STATUSES,
  b: APPLICATION_STATUSES
): number => STATUS_SORT_RANK[a] - STATUS_SORT_RANK[b];

const ApplicationArchiveList: React.FC<SearchProps> = ({
  data = [],
  isSearchLoading,
  submittedSearchString,
  searchString,
}) => {
  const { t, list, translationsBase, getHeader } = useApplicationsArchive();
  const theme = useTheme();

  interface TableTransforms {
    id: string;
    companyName: string;
    status: APPLICATION_STATUSES;
  }

  const getTransformForArchivedStatus = ({
    status,
  }: TableTransforms): JSX.Element => (
    <$TagWrapper $colors={getTagStyleForStatus(status)}>
      <Tag>
        {status === APPLICATION_STATUSES.ACCEPTED && <IconCheck />}
        {status === APPLICATION_STATUSES.REJECTED && <IconCross />}
        {status === APPLICATION_STATUSES.CANCELLED && <IconAlertCircle />}
        {t(
          `common:applications.list.columns.applicationStatuses.${String(
            status
          )}`
        )}
      </Tag>
    </$TagWrapper>
  );

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
      headerName: getHeader('calculationEndDate'),
      key: 'calculationEndDate',
      isSortable: true,
      customSortCompareFunction: sortFinnishDate,
    },
    {
      transform: getTransformForArchivedStatus,
      headerName: t(`${translationsBase}.columns.statusArchive`)?.toString(),
      key: 'status',
      isSortable: true,
      customSortCompareFunction: sortByStatus,
    },
  ];

  const hasSearchLoadedWithResults =
    !isSearchLoading &&
    submittedSearchString !== '' &&
    submittedSearchString === searchString &&
    searchString.length > 0 &&
    data?.length > 0;

  const hasSearchLoadedWithNoResults =
    !isSearchLoading &&
    submittedSearchString !== '' &&
    searchString !== '' &&
    data?.length === 0;

  const hasCurrentlyNoSearch =
    !isSearchLoading &&
    list.length > 0 &&
    (submittedSearchString === '' || searchString === '');

  return (
    <>
      {hasCurrentlyNoSearch && (
        <>
          <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
            count: list?.length || 0,
          })}`}</$ArchiveCount>
          <Table
            indexKey="id"
            theme={theme.components.table}
            rows={list || []}
            cols={cols}
          />
        </>
      )}

      {isSearchLoading && (
        <>
          <$ArchiveCount>{t('common:search.performingSearch')}</$ArchiveCount>
          <LoadingSkeleton
            borderRadius={0}
            baseColor={theme.colors.fog}
            height={50}
          />
          <LoadingSkeleton height={67} />
        </>
      )}

      {hasSearchLoadedWithResults && (
        <>
          <$ArchiveCount>{`${t(`${translationsBase}.total.count`, {
            count: data?.length || 0,
          })}`}</$ArchiveCount>
          <Table
            aria-live="polite"
            indexKey="id"
            theme={theme.components.table}
            rows={prepareSearchData(data)}
            cols={cols}
            zebra
          />
        </>
      )}
      {hasSearchLoadedWithNoResults && (
        <h2 aria-live="polite">{t('common:search.noResults')}</h2>
      )}
    </>
  );
};

export default ApplicationArchiveList;
