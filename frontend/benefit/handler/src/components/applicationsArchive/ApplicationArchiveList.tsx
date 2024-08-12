import { getTagStyleForStatus } from 'benefit/handler/utils/applications';
import {
  ALTERATION_STATE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import {
  ApplicationAlterationData,
  ApplicationData,
} from 'benefit-shared/types/application';
import { IconAlertCircle, IconCheck, IconCross, Table, Tag } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $Link } from 'shared/components/table/Table.sc';
import { sortFinnishDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import {
  $AlterationBadge,
  $TagWrapper,
} from '../applicationList/ApplicationList.sc';
import { $ArchiveCount, $CompanyNameDisabled } from './ApplicationsArchive.sc';
import { prepareSearchData } from './useApplicationsArchive';

type SearchProps = {
  data: ApplicationData[];
  isSearchLoading: boolean;
};

const STATUS_SORT_RANK = {
  [APPLICATION_STATUSES.ACCEPTED]: 1,
  [APPLICATION_STATUSES.REJECTED]: 0,
  [APPLICATION_STATUSES.CANCELLED]: -1,
  [APPLICATION_STATUSES.ARCHIVAL]: -2,
};

const sortByStatus = (
  a: APPLICATION_STATUSES,
  b: APPLICATION_STATUSES
): number => STATUS_SORT_RANK[a] - STATUS_SORT_RANK[b];

const ApplicationArchiveList: React.FC<SearchProps> = ({
  data = [],
  isSearchLoading,
}) => {
  const { t } = useTranslation();

  const theme = useTheme();

  interface TableTransforms {
    id: string;
    companyName: string;
    status: APPLICATION_STATUSES;
    alterations: ApplicationAlterationData[];
  }

  const rows = React.useMemo(() => prepareSearchData(data), [data]);

  const getTransformForArchivedStatus = ({
    status,
  }: TableTransforms): JSX.Element => (
    <$TagWrapper $colors={getTagStyleForStatus(status)}>
      <Tag>
        {status === APPLICATION_STATUSES.ACCEPTED && <IconCheck />}
        {status === APPLICATION_STATUSES.REJECTED && <IconCross />}
        {status === APPLICATION_STATUSES.CANCELLED && <IconAlertCircle />}
        {status === APPLICATION_STATUSES.ARCHIVAL && <IconCheck />}

        {t(
          `common:applications.list.columns.applicationStatuses.${String(
            status
          )}`
        )}
      </Tag>
    </$TagWrapper>
  );

  const translationsBase = 'common:applications.list';
  const getHeader = (id: string): string =>
    t(`${translationsBase}.columns.${id}`);

  const cols = [
    {
      transform: ({ id, companyName, status }: TableTransforms) =>
        status === APPLICATION_STATUSES.ARCHIVAL ? (
          <$CompanyNameDisabled>{String(companyName)}</$CompanyNameDisabled>
        ) : (
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
    {
      transform: ({ alterations }: TableTransforms) =>
        alterations?.length > 0 && (
          <$AlterationBadge
            $requiresAttention={alterations.some(({ state }) =>
              [ALTERATION_STATE.RECEIVED, ALTERATION_STATE.OPENED].includes(
                state
              )
            )}
          >
            {alterations.length}
          </$AlterationBadge>
        ),
      headerName: '',
      key: 'alterations',
    },
  ];

  const hasSearchLoadedWithResults = !isSearchLoading && data.length > 0;
  const hasSearchLoadedWithNoResults = !isSearchLoading && data.length === 0;

  return (
    <>
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
            initialSortingColumnKey="handledAt"
            initialSortingOrder="desc"
            theme={theme.components.table}
            rows={rows}
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
