import {
  $EmptyListText,
  $Heading,
  $Link,
  $Subheading,
} from 'benefit/handler/components/alterationList/AlterationList.sc';
import { ROUTES } from 'benefit/handler/constants';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { IconArrowRight, Table } from 'hds-react';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import LinkButton from 'shared/components/link-button/LinkButton';
import { formatDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

type Props = {
  isLoading: boolean;
  list: Array<ApplicationAlterationData>;
  heading: string;
};

const AlterationList: React.FC<Props> = ({ isLoading, list, heading }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const columns = [
    {
      headerName: t('common:applications.alterations.list.columns.applicant'),
      key: 'application_company_name',
      isSortable: true,
      transform: ({
        application_company_name,
        application,
      }: ApplicationAlterationData) => (
        <$Link
          href={`${ROUTES.APPLICATION}/?id=${application}`}
          target="_blank"
        >
          {application_company_name}
        </$Link>
      ),
    },
    {
      headerName: t(
        'common:applications.alterations.list.columns.applicationNumber'
      ),
      key: 'application_number',
      isSortable: true,
    },
    {
      headerName: t(
        'common:applications.alterations.list.columns.receivedDate'
      ),
      key: 'created_at',
      isSortable: true,
      transform: ({ created_at }: ApplicationAlterationData) =>
        created_at ? formatDate(new Date(created_at)) : '-',
    },
    {
      headerName: t('common:applications.alterations.list.columns.employee'),
      key: 'application_employee_last_name',
      isSortable: true,
      transform: ({
        application_employee_first_name,
        application_employee_last_name,
      }: ApplicationAlterationData) =>
        `${application_employee_first_name || ''} ${
          application_employee_last_name || ''
        }`,
    },
    {
      headerName: t('common:applications.alterations.list.columns.summary'),
      key: 'summary',
      isSortable: false,
      transform: ({
        alteration_type,
        end_date,
        resume_date,
      }: ApplicationAlterationData) =>
        t(`common:applications.alterations.list.summary.${alteration_type}`, {
          endDate: formatDate(new Date(end_date)),
          resumeDate: resume_date ? formatDate(new Date(resume_date)) : '',
        }),
    },
    {
      headerName: '',
      key: 'actions',
      isSortable: false,
      transform: ({ id, application }: ApplicationAlterationData) => (
        <div>
          <LinkButton
            style={{ display: 'flex', alignItems: 'center' }}
            theme="coat"
            iconRight={<IconArrowRight />}
            onClick={() =>
              router.push(
                `${ROUTES.HANDLE_ALTERATION}/?applicationId=${application}&alterationId=${id}`
              )
            }
          >
            {t('common:applications.alterations.list.actions.startHandling')}
          </LinkButton>
        </div>
      ),
    },
  ];

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

  return (
    <div data-testid="alteration-list">
      <$Subheading>
        <Trans
          i18nKey="common:applications.alterations.list.subheading"
          values={{ count: list.length }}
          components={{ b: <strong /> }}
        />
      </$Subheading>
      {list.length > 0 ? (
        <Table
          theme={theme.components.table}
          indexKey="id"
          rows={list}
          cols={columns}
          initialSortingColumnKey="created_at"
          initialSortingOrder="desc"
        />
      ) : (
        <$EmptyListText>
          {t(`common:applications.alterations.list.empty`)}
        </$EmptyListText>
      )}
    </div>
  );
};

export default AlterationList;
