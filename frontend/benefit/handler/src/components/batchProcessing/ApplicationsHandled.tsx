import { $EmptyHeading } from 'benefit/handler/components/applicationList/ApplicationList.sc';
import useAddToBatchQuery from 'benefit/handler/hooks/useApplicationToBatch';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Button, LoadingSpinner, Table } from 'hds-react';
import React, { useEffect, useMemo, useState } from 'react';
import Container from 'shared/components/container/Container';
import { $Link } from 'shared/components/table/Table.sc';
import theme from 'shared/styles/theme';
import styled from 'styled-components';

import { useApplicationsHandled } from './useApplicationsHandled';

const $HintText = styled.p`
  margin-top: 0;
  margin-bottom: var(--spacing-s);
`;

export const $TableFooter = styled.footer`
  background: ${(props) => props.theme.colors.black10};
  width: 100%;
  padding: var(--spacing-s);
  display: flex;
  flex-flow: row wrap;
  box-sizing: border-box;
  ${$HintText} {
    flex-basis: 100%;
    margin-top: 0;
    &:empty {
      margin: 0;
    }
  }
`;

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
      },
    ];
    return cols.filter(Boolean);
  }, [t, getHeader, translationsBase]);

  if (shouldShowSkeleton) {
    return (
      <Container>
        <LoadingSpinner small />
      </Container>
    );
  }

  return (
    <Container data-testid="application-list-archived">
      {!shouldHideList ? (
        <>
          <Table
            theme={{ '--header-background-color': theme.colors.coatOfArms }}
            indexKey="id"
            rows={applications}
            initialSortingColumnKey="applicationNum"
            initialSortingOrder="asc"
            heading={`${t(
              `common:applications.list.headings.${status}`
            )} päätökset (${applications.length})`}
            cols={columns}
            checkboxSelection
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
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
    </Container>
  );
};

export default ApplicationsHandled;
