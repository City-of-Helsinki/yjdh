import { ALL_APPLICATION_STATUSES, ROUTES } from 'benefit/handler/constants';
import {
  ApplicationListTableColumns,
  ApplicationListTableTransforms,
} from 'benefit/handler/types/applicationList';
import { getTagStyleForStatus } from 'benefit/handler/utils/applications';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  AhjoError,
  ApplicationListItemData,
  Instalment,
} from 'benefit-shared/types/application';
import { IconSpeechbubbleText, Table, Tag, Tooltip } from 'hds-react';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $Link } from 'shared/components/table/Table.sc';
import {
  convertToUIDateAndTimeFormat,
  sortFinnishDate,
  sortFinnishDateTime,
} from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $ActionErrors,
  $ActionMessages,
  $ApplicationList,
  $EmptyHeading,
  $Heading,
  $TableActions,
  $TagWrapper,
  $UnreadMessagesCount,
} from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  status: APPLICATION_STATUSES[];
  list?: ApplicationListItemData[];
  isLoading: boolean;
  inPayment?: boolean;
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

const getFirstInstalmentTotalAmount = (
  calculatedBenefitAmount: string,
  pendingInstalment?: Instalment
): string | JSX.Element => {
  let firstInstalment = parseInt(calculatedBenefitAmount, 10);
  if (pendingInstalment) {
    firstInstalment -= parseInt(String(pendingInstalment?.amount), 10);
  }
  return pendingInstalment ? (
    <>
      {formatFloatToCurrency(firstInstalment, null, 'fi-FI', 0)} /{' '}
      {formatFloatToCurrency(calculatedBenefitAmount, 'EUR', 'fi-FI', 0)}
    </>
  ) : (
    formatFloatToCurrency(firstInstalment, 'EUR', 'fi-FI', 0)
  );
};
const dateForAdditionalInformationNeededBy = (
  dateString: string | Date
): string => ` ${String(dateString).replace(/\d{4}$/, '')}`;

const ApplicationList: React.FC<ApplicationListProps> = ({
  heading,
  status,
  list = [],
  isLoading = true,
  inPayment = false,
}) => {
  const { t, translationsBase, getHeader } = useApplicationList();
  const theme = useTheme();

  const isAllStatuses: boolean = status === ALL_APPLICATION_STATUSES;
  const isVisibleOnlyForStatus = React.useMemo(
    () => ({
      draft: status.includes(APPLICATION_STATUSES.DRAFT) && !isAllStatuses,
      received:
        status.includes(APPLICATION_STATUSES.RECEIVED) && !isAllStatuses,
      handling:
        status.includes(APPLICATION_STATUSES.HANDLING) && !isAllStatuses,
      infoRequired:
        status.includes(APPLICATION_STATUSES.INFO_REQUIRED) && !isAllStatuses,
      accepted:
        status.includes(APPLICATION_STATUSES.ACCEPTED) && !isAllStatuses,
      rejected:
        status.includes(APPLICATION_STATUSES.REJECTED) && !isAllStatuses,
    }),
    [isAllStatuses, status]
  );

  const renderTableActions = React.useCallback(
    (
      id: string,
      applicationStatus: APPLICATION_STATUSES,
      unreadMessagesCount: number,
      ahjoError: AhjoError
    ): JSX.Element => (
      <$TableActions>
        {Number(unreadMessagesCount) > 0 ? (
          <$ActionMessages>
            <$Link href={buildApplicationUrl(id, applicationStatus, true)}>
              <IconSpeechbubbleText color={theme.colors.coatOfArms} />
              <$UnreadMessagesCount>
                {Number(unreadMessagesCount)}
              </$UnreadMessagesCount>
            </$Link>
          </$ActionMessages>
        ) : null}
        {ahjoError?.errorFromAhjo && (
          <$ActionErrors
            $errorText={t(
              'common:applications.list.errors.ahjoError.buttonText'
            )}
          >
            <Tooltip
              placement="top"
              boxShadow
              className="custom-tooltip-error"
              tooltipLabel={t(
                'common:applications.list.errors.ahjoError.tooltipLabel'
              )}
              buttonLabel={t(
                'common:applications.list.errors.ahjoError.buttonLabel'
              )}
            >
              <div>
                <strong>
                  Ahjo, {convertToUIDateAndTimeFormat(ahjoError?.modifiedAt)}
                </strong>
              </div>
              <ul>
                {ahjoError?.errorFromAhjo?.map
                  ? ahjoError?.errorFromAhjo?.map(({ message }) => (
                      <li>{message}</li>
                    ))
                  : ahjoError?.errorFromAhjo}
              </ul>
            </Tooltip>
          </$ActionErrors>
        )}
      </$TableActions>
    ),
    [t, theme.colors.coatOfArms]
  );

  const renderTagWrapper = React.useCallback(
    (
      applicationStatus: APPLICATION_STATUSES,
      additionalInformationNeededBy: string | Date
    ): JSX.Element => (
      <$TagWrapper $colors={getTagStyleForStatus(applicationStatus)}>
        <Tag>
          {t(
            `common:applications.list.columns.applicationStatuses.${String(
              applicationStatus
            )}`
          )}
          {applicationStatus === APPLICATION_STATUSES.INFO_REQUIRED &&
            dateForAdditionalInformationNeededBy(additionalInformationNeededBy)}
        </Tag>
      </$TagWrapper>
    ),
    [t]
  );

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
        headerName: getHeader('employeeName'),
        key: 'employeeName',
        isSortable: true,
      },
    ];

    if (
      isVisibleOnlyForStatus.handling ||
      isVisibleOnlyForStatus.infoRequired
    ) {
      cols.push({
        headerName: getHeader('handlerName'),
        key: 'handlerName',
        isSortable: true,
      });
    }
    if (
      (!status.includes(APPLICATION_STATUSES.DRAFT) &&
        !status.includes(APPLICATION_STATUSES.ACCEPTED) &&
        !status.includes(APPLICATION_STATUSES.REJECTED)) ||
      isAllStatuses
    ) {
      cols.push({
        headerName: getHeader('submittedAt'),
        key: 'submittedAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
      });
    }

    if (
      (!inPayment && isVisibleOnlyForStatus.accepted) ||
      isVisibleOnlyForStatus.rejected
    ) {
      cols.push({
        headerName: getHeader('handledAt'),
        key: 'handledAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDate,
      });
    }

    if (isVisibleOnlyForStatus.draft) {
      cols.push({
        headerName: getHeader('modifiedAt'),
        key: 'modifiedAt',
        isSortable: true,
        customSortCompareFunction: sortFinnishDateTime,
      });
    }

    if (
      !inPayment &&
      (isVisibleOnlyForStatus.accepted ||
        isVisibleOnlyForStatus.rejected ||
        isVisibleOnlyForStatus.infoRequired ||
        isVisibleOnlyForStatus.handling ||
        isAllStatuses)
    ) {
      cols.push(
        {
          transform: ({
            status: applicationStatus,
            additionalInformationNeededBy,
          }: ApplicationListTableTransforms) =>
            renderTagWrapper(applicationStatus, additionalInformationNeededBy),
          headerName: getHeader('applicationStatus'),
          key: 'status',
          isSortable: true,
        },

        {
          transform: ({
            id,
            status: applicationStatus,
            unreadMessagesCount,
            ahjoError,
          }: ApplicationListTableTransforms) =>
            renderTableActions(
              id,
              applicationStatus,
              unreadMessagesCount,
              ahjoError
            ),
          headerName: getHeader('unreadMessagesCount'),
          key: 'unreadMessagesCount',
          isSortable: false,
        }
      );
    }

    if (isVisibleOnlyForStatus.received) {
      cols.push({
        transform: ({ applicationOrigin }: ApplicationListTableTransforms) => (
          <div>
            <Tag>
              {t(
                `common:applications.list.columns.applicationOrigins.${String(
                  applicationOrigin
                )}`
              )}
            </Tag>
          </div>
        ),
        headerName: getHeader('origin'),
        key: 'applicationOrigin',
        isSortable: true,
      });
    }

    if (inPayment) {
      cols.push(
        {
          customSortCompareFunction: sortFinnishDate,
          headerName: getHeader('decisionDate'),
          key: 'decisionDate',
          isSortable: true,
        },
        {
          headerName: getHeader('paymentStatus'),
          key: 'paymentStatus',
          isSortable: true,
          transform: ({ talpaStatus }) =>
            t(`applications.list.columns.talpaStatuses.${String(talpaStatus)}`),
        },
        {
          headerName: getHeader('calculatedBenefitAmount'),
          key: 'calculatedBenefitAmount',
          transform: ({
            calculatedBenefitAmount,
            pendingInstalment,
          }: ApplicationListTableTransforms) =>
            getFirstInstalmentTotalAmount(
              String(calculatedBenefitAmount),
              pendingInstalment || null
            ),
        }
      );
    }

    return cols.filter(Boolean);
  }, [
    getHeader,
    isVisibleOnlyForStatus.handling,
    isVisibleOnlyForStatus.infoRequired,
    isVisibleOnlyForStatus.accepted,
    isVisibleOnlyForStatus.rejected,
    isVisibleOnlyForStatus.draft,
    isVisibleOnlyForStatus.received,
    status,
    isAllStatuses,
    inPayment,
    renderTagWrapper,
    renderTableActions,
    t,
  ]);

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

  const statusAsString = isAllStatuses ? 'all' : status.join(',');
  return (
    <$ApplicationList data-testid={`application-list-${statusAsString}`}>
      {list.length > 0 ? (
        <Table
          heading={`${heading} (${list.length})`}
          theme={theme.components.table}
          indexKey="id"
          rows={list}
          cols={columns}
          zebra
        />
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.${statusAsString}`)}
        </$EmptyHeading>
      )}
    </$ApplicationList>
  );
};

export default ApplicationList;
