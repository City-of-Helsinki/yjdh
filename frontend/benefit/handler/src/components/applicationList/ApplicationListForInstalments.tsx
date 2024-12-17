import { ROUTES } from 'benefit/handler/constants';
import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
import {
  ApplicationListTableColumns,
  ApplicationListTableTransforms,
} from 'benefit/handler/types/applicationList';
import { getInstalmentTagStyleForStatus } from 'benefit/handler/utils/applications';
import {
  ALTERATION_STATE,
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { IconErrorFill, Table, Tag } from 'hds-react';
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
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';
import {
  $Column,
  $Wrapper,
} from '../applicationReview/actions/handlingApplicationActions/HandlingApplicationActions.sc';
import {
  $AlterationBadge,
  $EmptyHeading,
  $Heading,
  $InstalmentList,
  $TagWrapper,
} from './ApplicationList.sc';
import ApplicationTableFooter from './ApplicationTableFooter';
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
  status?: INSTALMENT_STATUSES
): JSX.Element =>
  status ? (
    <$TagWrapper $colors={getInstalmentTagStyleForStatus(status)}>
      <Tag>
        {t(`common:applications.list.columns.instalmentStatuses.${status}`)}
      </Tag>
    </$TagWrapper>
  ) : null;

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
      {
        headerName: getHeader('dueDate'),
        key: 'dueDate',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
        transform: ({ secondInstalment }: ApplicationListTableTransforms) =>
          convertToUIDateFormat(secondInstalment?.dueDate),
      },

      {
        transform: ({ secondInstalment }: ApplicationListTableTransforms) =>
          renderInstalmentTagPerStatus(
            t,
            secondInstalment?.status as INSTALMENT_STATUSES
          ),
        headerName: getHeader('paymentStatus'),
        key: 'status',
        isSortable: true,
      },
      {
        transform: ({ secondInstalment }: ApplicationListTableTransforms) =>
          secondInstalment?.amountAfterRecoveries > 0 ? (
            <>
              {formatFloatToEvenEuros(
                Math.max(0, secondInstalment?.amountAfterRecoveries)
              )}
              {' / '}
              {formatFloatToEvenEuros(secondInstalment.amount)}
            </>
          ) : (
            <$Wrapper>
              <$Column>
                <IconErrorFill color="var(--color-alert)" />{' '}
                {formatFloatToEvenEuros(secondInstalment.amountAfterRecoveries)}
              </$Column>
            </$Wrapper>
          ),
        headerName: getHeader('instalmentAmount'),
        key: 'instalmentAmount',
        isSortable: true,
      },
      {
        transform: ({ alterations }: ApplicationListTableTransforms) =>
          alterations?.length > 0 && (
            <$AlterationBadge
              $requiresAttention={alterations.some(({ state }) =>
                [ALTERATION_STATE.RECEIVED, ALTERATION_STATE.OPENED].includes(
                  state as ALTERATION_STATE
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
    )?.secondInstalment || null;

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
          {selectedRows.length > 0 && (
            <ApplicationTableFooter
              selectedRows={selectedRows}
              list={list}
              isLoading={isLoading}
              isLoadingStatusChange={isLoadingStatusChange}
              translationsBase={translationsBase}
              changeInstalmentStatus={changeInstalmentStatus}
              setIsInstalmentCancelModalShown={setIsInstalmentCancelModalShown}
            />
          )}
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
                  sum: formatFloatToEvenEuros(selectedInstalment?.amount),
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
