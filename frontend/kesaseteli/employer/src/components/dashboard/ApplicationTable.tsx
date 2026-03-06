import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

import DashboardFilterBar from './DashboardFilterBar';
import StatusTag from './StatusTag';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${(props) => props.theme.spacing.m};

  th {
    text-align: left;
    padding: ${(props) => props.theme.spacing.s};
    border-bottom: 2px solid ${(props) => props.theme.colors.black};
  }

  td {
    padding: ${(props) => props.theme.spacing.s};
    border-bottom: 1px solid ${(props) => props.theme.colors.black20};
  }
`;

type Props = {
  vouchers: DashboardVoucher[];
  showOnlyMine: boolean;
  onToggleOnlyMine: () => void;
};

const ApplicationTable: React.FC<Props> = ({
  vouchers,
  showOnlyMine,
  onToggleOnlyMine,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <DashboardFilterBar showOnlyMine={showOnlyMine} onToggle={onToggleOnlyMine} />
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
          {vouchers.map((voucher) => (
            <tr key={voucher.id}>
              <td>{voucher.employee_name || '-'}</td>
              <td>{voucher.summer_voucher_serial_number || '-'}</td>
              <td>{convertToUIDateAndTimeFormat(voucher.modified_at)}</td>
              <td>
                <StatusTag status={voucher.applicationStatus} />
              </td>
            </tr>
          ))}
          {vouchers.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                {t('common:dashboard.noApplications')}
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </>
  );
};

export default ApplicationTable;
