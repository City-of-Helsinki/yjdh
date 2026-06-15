import { Pagination } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import styled, { DefaultTheme } from 'styled-components';

import StatusTag from '../StatusTag';
import { useApplicationTable } from './ApplicationTableContext';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};

  th {
    text-align: left;
    padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
    border-bottom: 2px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.black};
  }

  td {
    padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
    border-bottom: 1px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.black20};
  }
`;

const $PaginationContainer = styled.div`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl2};
`;

type ApplicationTableRowProps = {
  application: Application;
};

/**
 * Renders a single application row.
 *
 * An application typically contains exactly one summer voucher — the API
 * actively restricts creating more than one per application. However, the
 * underlying data model allows multiple vouchers (e.g. legacy data may have
 * more than one), so employee names and serial numbers are joined with a
 * comma to handle those cases gracefully.
 */
const ApplicationTableRow: React.FC<ApplicationTableRowProps> = ({
  application,
}) => {
  const employeeNames =
    (application.summer_vouchers || [])
      .map((v) => v.employee_name)
      .filter(Boolean)
      .join(', ') || '-';
  const serialNumbers =
    (application.summer_vouchers || [])
      .map((v) => v.summer_voucher_serial_number)
      .filter(Boolean)
      .join(', ') || '-';
  const modifiedAt =
    (application as typeof application & { modified_at?: string })
      .modified_at ||
    application.submitted_at ||
    '';
  return (
    <tr>
      <td>{employeeNames}</td>
      <td>{serialNumbers}</td>
      <td>{convertToUIDateAndTimeFormat(modifiedAt)}</td>
      <td>
        <StatusTag status={application.status} />
      </td>
    </tr>
  );
};

/**
 * Renders the table content of the application table.
 *
 * Each row represents one EmployerApplication. While the current API enforces
 * a single summer voucher per application, the data model permits multiple —
 * so for historical reasons an application may still carry more than one. Row
 * values that originate from vouchers (employee name, serial number) are
 * therefore joined with a comma when multiple vouchers are present.
 *
 * Renders pagination when there are more applications than what fits on one
 * page (default limit 15). Page state is managed in ApplicationTableContext.
 */
const ApplicationTableContent: React.FC = () => {
  const { applications, isLoading, pageIndex, setPageIndex, pageCount } =
    useApplicationTable();
  const locale = useLocale();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
      >
        <PageLoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <StyledTable>
        <thead>
          <tr>
            <th>{t('common:application.form.inputs.employee_name')}</th>
            <th>
              {t('common:application.form.inputs.summer_voucher_serial_number')}
            </th>
            <th>{t('common:application.form.inputs.modified_at')}</th>
            <th>{t('common:application.form.inputs.status')}</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                {t('common:dashboard.noApplications')}
              </td>
            </tr>
          ) : (
            applications.map((application) => (
              <ApplicationTableRow
                key={application.id}
                application={application}
              />
            ))
          )}
        </tbody>
      </StyledTable>
      {pageCount > 1 && (
        <$PaginationContainer>
          <Pagination
            pageHref={() => '#'}
            pageIndex={pageIndex}
            pageCount={pageCount}
            paginationAriaLabel={t('common:utility.pagination')}
            onChange={(e, index) => {
              e.preventDefault();
              setPageIndex(index);
            }}
            language={locale}
          />
        </$PaginationContainer>
      )}
    </>
  );
};

export default ApplicationTableContent;
