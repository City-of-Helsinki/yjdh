import {
  $EmptyHeading,
  $Heading,
} from 'benefit/handler/components/applicationList/ApplicationList.sc';
import useAddToBatchQuery from 'benefit/handler/hooks/useApplicationToBatch';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Button, Table } from 'hds-react';
import React, { useEffect, useMemo, useState } from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import { $Link } from 'shared/components/table/Table.sc';
import theme from 'shared/styles/theme';
import { sortFinnishDate } from 'shared/utils/date.utils';

import {
  $HintText,
  $TableContainer,
  $TableFooter,
} from '../table/TableExtras.sc';
import { useApplicationsHandled } from './useApplicationsHandled';

type Props = {
  status: APPLICATION_STATUSES;
  excludeBatched?: boolean;
};
const ApplicationsHandled: React.FC<Props> = ({
  status,
  excludeBatched = false,
}) => {
  const {
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationsHandled(status, excludeBatched);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const applications = useMemo(() => list, [list]);
  const { isSuccess, mutate: createBatch } = useAddToBatchQuery();

  useEffect(() => {
    setSelectedRows([]);
  }, [isSuccess]);

  const handleBatchChange = (): void => {
    createBatch({ applicationIds: selectedRows, status });
  };

  const columns = useMemo(() => {
    const cols = [
      {
        transform: ({ id, companyName }) => (
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
        headerName: t(
          `${translationsBase}.columns.employeeNameArchive`
        )?.toString(),
        key: 'employeeName',
        isSortable: true,
      },
      {
        headerName: getHeader('handledAt'),
        key: 'handledAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
      },
    ];
    return cols.filter(Boolean);
  }, [t, getHeader, translationsBase]);

  if (shouldShowSkeleton) {
    return (
      <Container>
        <$Heading css={{ marginBottom: theme.spacing.xs }}>
          {t(`common:applications.list.headings.${status}`)}{' '}
          {t(`common:applications.list.headings.decisions`)}
        </$Heading>
        <LoadingSkeleton
          borderRadius={0}
          baseColor={theme.colors.fog}
          height={50}
        />
        <LoadingSkeleton height={67} />
      </Container>
    );
  }

  return (
    <$TableContainer data-testid="application-list-archived">
      {!shouldHideList ? (
        <>
          <Table
            theme={{ '--header-background-color': theme.colors.coatOfArms }}
            indexKey="id"
            rows={applications}
            initialSortingColumnKey="applicationNum"
            initialSortingOrder="asc"
            heading={`${t(`common:applications.list.headings.${status}`)} ${t(
              `common:applications.list.headings.decisions`
            )} (${applications.length})`}
            cols={columns}
            checkboxSelection
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            zebra
          />
          <$TableFooter>
            <$HintText>
              {selectedRows.length > 0 ? (
                <span>
                  {selectedRows.length > 1
                    ? t(
                        `${translationsBase}.selectedApplications.count_other`,
                        { count: selectedRows.length }
                      )
                    : t(`${translationsBase}.selectedApplications.count_one`, {
                        count: selectedRows.length,
                      })}
                </span>
              ) : null}
            </$HintText>
            <Button
              theme="coat"
              onClick={() => handleBatchChange()}
              disabled={selectedRows.length === 0}
            >
              {t(`${translationsBase}.actions.addToBatch`)}
            </Button>
          </$TableFooter>
        </>
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.${status}`)}
        </$EmptyHeading>
      )}
    </$TableContainer>
  );
};

export default ApplicationsHandled;
