import { ROUTES } from 'benefit/handler/constants';
import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
import {
  ApplicationListTableColumns,
  ApplicationListTableTransforms,
} from 'benefit/handler/types/applicationList';
import { getInstalmentTagStyleForStatus } from 'benefit/handler/utils/applications';
import {
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import {
  ApplicationListItemData,
  Instalment,
} from 'benefit-shared/types/application';
import {
  Button,
  IconArrowUndo,
  IconCheck,
  IconCross,
  Table,
  Tag,
} from 'hds-react';
import noop from 'lodash/noop';
import { TFunction } from 'next-i18next';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Modal from 'shared/components/modal/Modal';
import { $Link } from 'shared/components/table/Table.sc';
import {
  convertToUIDateFormat,
  sortFinnishDate,
} from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';
import {
  $Column,
  $Wrapper,
} from '../applicationReview/actions/handlingApplicationActions/HandlingApplicationActions.sc';
import { $HintText, $TableFooter } from '../table/TableExtras.sc';
import {
  $EmptyHeading,
  $Heading,
  $InstalmentList,
  $TagWrapper,
} from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  list?: ApplicationListItemData[];
  isLoading: boolean;
}

const buildApplicationUrl = (
  id: string,
  status: APPLICATION_STATUSES,
  openDrawer = false
): string => {
  if (status === APPLICATION_STATUSES.DRAFT) {
    return `${ROUTES.APPLICATION_FORM_NEW}?id=${id}`;
  }

  const applicationUrl = `${ROUTES.APPLICATION}?id=${id}`;
  if (openDrawer) {
    return `${applicationUrl}&openDrawer=1`;
  }
  return applicationUrl;
};

export const renderInstalmentTagPerStatus = (
  t: TFunction,
  pendingInstalment: Instalment
): JSX.Element => (
  <$TagWrapper
    $colors={getInstalmentTagStyleForStatus(
      pendingInstalment?.status as INSTALMENT_STATUSES
    )}
  >
    <Tag>
      {t(
        `common:applications.list.columns.instalmentStatuses.${
          pendingInstalment?.status as INSTALMENT_STATUSES
        }`
      )}
    </Tag>
  </$TagWrapper>
);

const ApplicationListForInstalments: React.FC<ApplicationListProps> = ({
  heading,
  list = [],
  isLoading = true,
}) => {
  const { t, translationsBase, getHeader } = useApplicationList();
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [isInstalmentCancelModalShown, setIsInstalmentCancelModalShown] =
    React.useState(false);
  const { mutate: changeInstalmentStatus, isLoading: isLoadingStatusChange } =
    useInstalmentStatusTransition();

  const columns = React.useMemo(() => {
    const cols: ApplicationListTableColumns[] = [
      {
        transform: ({
          id,
          companyName,
          unreadMessagesCount,
          status: applicationStatus,
        }: ApplicationListTableTransforms) => (
          <$Link
            href={buildApplicationUrl(
              id,
              applicationStatus,
              unreadMessagesCount > 0
            )}
          >
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

      // {
      //   headerName: getHeader('employeeName'),
      //   key: 'employeeName',
      //   isSortable: true,
      // },
    ];

    cols.push(
      {
        headerName: getHeader('dueDate'),
        key: 'dueDate',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
        transform: ({ pendingInstalment }: ApplicationListTableTransforms) =>
          convertToUIDateFormat(pendingInstalment?.dueDate),
      },

      {
        transform: ({ pendingInstalment }: ApplicationListTableTransforms) =>
          renderInstalmentTagPerStatus(t, pendingInstalment),
        headerName: getHeader('paymentStatus'),
        key: 'status',
        isSortable: true,
      },
      {
        transform: ({
          calculatedBenefitAmount,
          pendingInstalment,
        }: ApplicationListTableTransforms) => (
          <>
            {formatFloatToCurrency(pendingInstalment?.amount, null, 'fi-FI', 0)}{' '}
            /{' '}
            {formatFloatToCurrency(calculatedBenefitAmount, 'EUR', 'fi-FI', 0)}
          </>
        ),
        headerName: getHeader('calculatedBenefitAmount'),
        key: 'calculatedBenefitAmount',
        isSortable: true,
      }
    );

    return cols.filter(Boolean);
  }, [getHeader, t]);

  if (isLoading) {
    return (
      <>
        {heading && (
          <$Heading
            css={{ marginBottom: theme.spacing.xs }}
          >{`${heading}`}</$Heading>
        )}
        <LoadingSkeleton
          borderRadius={0}
          baseColor={theme.colors.fog}
          height={50}
        />
        <LoadingSkeleton height={67} />
      </>
    );
  }

  const selectedApplication = list.find((app) => app.id === selectedRows[0]);
  const selectedInstalment =
    list.find(
      (app: ApplicationListItemData) =>
        app.id === String(selectedApplication?.id)
    )?.pendingInstalment || null;

  const onSubmitCancel = (): void => {
    changeInstalmentStatus({
      id: selectedInstalment?.id,
      status: INSTALMENT_STATUSES.CANCELLED,
    });
    setIsInstalmentCancelModalShown(false);
  };

  return (
    <$InstalmentList data-testid="instalment-list">
      {list.length > 0 ? (
        <>
          <Table
            heading={`${heading} (${list.length})`}
            theme={theme.components.table}
            indexKey="id"
            initialSortingColumnKey="status"
            rows={list}
            cols={columns}
            checkboxSelection
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            zebra
          />
          <$TableFooter>
            <$Wrapper>
              <$Column>
                {(selectedRows.length === 0 || selectedRows.length > 1) && (
                  <$HintText>Valitse yksi hakemus</$HintText>
                )}

                {selectedApplication &&
                  selectedRows.length === 1 &&
                  selectedInstalment && (
                    <>
                      {selectedInstalment.status ===
                        INSTALMENT_STATUSES.WAITING && (
                        <Button
                          disabled={isLoading || isLoadingStatusChange}
                          theme="coat"
                          iconLeft={<IconCheck />}
                          onClick={() =>
                            changeInstalmentStatus({
                              id: selectedInstalment.id,
                              status: INSTALMENT_STATUSES.ACCEPTED,
                            })
                          }
                        >
                          {t(`${translationsBase}.actions.confirm`)}
                        </Button>
                      )}

                      {selectedInstalment.status ===
                        INSTALMENT_STATUSES.WAITING && (
                        <Button
                          disabled={isLoading || isLoadingStatusChange}
                          theme="coat"
                          iconLeft={<IconCross />}
                          onClick={() => setIsInstalmentCancelModalShown(true)}
                        >
                          {t(`${translationsBase}.actions.cancel`)}
                        </Button>
                      )}

                      {[
                        INSTALMENT_STATUSES.ACCEPTED,
                        INSTALMENT_STATUSES.CANCELLED,
                      ].includes(
                        selectedInstalment?.status as INSTALMENT_STATUSES
                      ) && (
                        <Button
                          disabled={isLoading || isLoadingStatusChange}
                          theme="coat"
                          iconLeft={<IconArrowUndo />}
                          onClick={() =>
                            changeInstalmentStatus({
                              id: selectedInstalment.id,
                              status: INSTALMENT_STATUSES.WAITING,
                            })
                          }
                        >
                          {t(`${translationsBase}.actions.return`)}
                        </Button>
                      )}
                    </>
                  )}
              </$Column>
            </$Wrapper>
          </$TableFooter>
          <Modal
            id="instalment-cancel-confirm"
            isOpen={isInstalmentCancelModalShown}
            submitButtonLabel=""
            cancelButtonLabel=""
            handleSubmit={noop}
            handleToggle={noop}
            variant="danger"
            customContent={
              <ConfirmModalContent
                variant="danger"
                heading={t(
                  'common:instalments.dialog.cancelInstalment.heading'
                )}
                text={t('common:instalments.dialog.cancelInstalment.text', {
                  sum: formatFloatToCurrency(
                    selectedInstalment?.amount,
                    'EUR',
                    'fi-FI',
                    0
                  ),
                  details: `${selectedApplication?.applicationNum}, ${selectedApplication?.companyName} / ${selectedApplication?.employeeName}`,
                })}
                onClose={() => setIsInstalmentCancelModalShown(false)}
                onSubmit={onSubmitCancel}
              />
            }
          />
        </>
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.instalments`)}
        </$EmptyHeading>
      )}
    </$InstalmentList>
  );
};

export default ApplicationListForInstalments;
