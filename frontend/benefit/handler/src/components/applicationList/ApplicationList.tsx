import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  IconSpeechbubbleText,
  LoadingSpinner,
  StatusLabel,
  Table,
} from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $Link } from 'shared/components/table/Table.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';
import { $CellContent, $EmptyHeading, $Heading } from './ApplicationList.sc';
import { useApplicationList } from './useApplicationList';

export interface ApplicationListProps {
  heading: string;
  status: APPLICATION_STATUSES[];
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  heading,
  status,
}) => {
  const {
    t,
    list,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
    getHeader,
  } = useApplicationList(status);

  const theme = useTheme();

  interface TableTransforms {
    id?: string;
    companyName?: string;
    unreadMessagesCount?: number;
    additionalInformationNeededBy?: string | Date;
    status?: APPLICATION_STATUSES;
  }

  const columns = React.useMemo(() => {
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
        headerName: getHeader('submittedAt'),
        key: 'submittedAt',
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

    if (status.includes(APPLICATION_STATUSES.HANDLING)) {
      cols.push({
        headerName: getHeader('handlerName'),
        key: 'handlerName',
        isSortable: true,
      });
    }

    if (status.includes(APPLICATION_STATUSES.INFO_REQUIRED)) {
      cols.push({
        transform: ({
          additionalInformationNeededBy,
          status: itemStatus,
        }: TableTransforms) => (
          <div>
            {itemStatus === APPLICATION_STATUSES.INFO_REQUIRED ? (
              <StatusLabel type="alert">
                {t(
                  `common:applications.list.columns.additionalInformationNeededByVal`,
                  {
                    date: convertToUIDateFormat(additionalInformationNeededBy),
                  }
                )}
              </StatusLabel>
            ) : null}
          </div>
        ),
        headerName: getHeader('additionalInformationNeededBy'),
        key: 'additionalInformationNeededBy',
        isSortable: false,
      });
    }

    cols.push({
      transform: ({ unreadMessagesCount }: TableTransforms) => (
        <$CellContent>
          {Number(unreadMessagesCount) > 0 ? (
            <IconSpeechbubbleText color={theme.colors.coatOfArms} />
          ) : null}
        </$CellContent>
      ),
      headerName: getHeader('unreadMessagesCount'),
      key: 'unreadMessagesCount',
      isSortable: false,
    });

    return cols.filter(Boolean);
  }, [t, getHeader, status, theme]);

  if (shouldShowSkeleton) {
    return (
      <Container>
        {heading && <$Heading>{`${heading} (0)`}</$Heading>}
        <LoadingSpinner small />
      </Container>
    );
  }

  const statusAsString = status.join(',');
  return (
    <Container data-testid={`application-list-${statusAsString}`}>
      {!shouldHideList ? (
        <>
          <$Heading>{`${heading} (${list.length})`}</$Heading>
          <Table
            theme={{ '--header-background-color': theme.colors.coatOfArms }}
            indexKey="id"
            rows={list}
            cols={columns}
          />
        </>
      ) : (
        <$EmptyHeading>
          {t(`${translationsBase}.messages.empty.${statusAsString}`)}
        </$EmptyHeading>
      )}
    </Container>
  );
};

export default ApplicationList;
