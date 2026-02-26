import { IconAlertCircle, IconCheckCircle, IconClock, IconPen, IconTrash, StatusLabel } from 'hds-react';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Status from 'shared/types/application-status';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

const StatusTag: React.FC<{ status: Status }> = ({ status }) => {
    const { t } = useTranslation();
    const label = t(`common:applications.statuses.${status}`);

    switch (status) {
        case 'accepted':
            return (
                <StatusLabel type="success" iconLeft={<IconCheckCircle aria-hidden />}>
                    {label}
                </StatusLabel>
            );

        case 'rejected':
            return (
                <StatusLabel type="error" iconLeft={<IconAlertCircle aria-hidden />}>
                    {label}
                </StatusLabel>
            );

        case 'submitted':
        case 'additional_information_provided':
            return (
                <StatusLabel type="alert" iconLeft={<IconClock aria-hidden />}>
                    {label}
                </StatusLabel>
            );

        case 'additional_information_requested':
            return (
                <StatusLabel type="info" iconLeft={<IconAlertCircle aria-hidden />}>
                    {label}
                </StatusLabel>
            );

        case 'draft':
            return (
                <StatusLabel iconLeft={<IconPen aria-hidden />}>{label}</StatusLabel>
            );

        case 'deleted_by_customer':
            return (
                <StatusLabel iconLeft={<IconTrash aria-hidden />}>{label}</StatusLabel>
            );

        default:
            return <StatusLabel>{label}</StatusLabel>;
    }
};

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
};

const ApplicationTable: React.FC<Props> = ({ vouchers }) => {
    const { t } = useTranslation();

    return (
        <StyledTable>
            <thead>
                <tr>
                    <th>{t('common:application.form.inputs.employee_name')}</th>
                    <th>{t('common:application.form.inputs.summer_voucher_serial_number')}</th>
                    <th>{t('common:application.form.inputs.modified_at')}</th>
                    <th>{t('common:application.form.inputs.status')}</th>
                </tr>
            </thead>
            <tbody>
                {vouchers.map((voucher) => (
                    <tr key={voucher.id}>
                        <td>{voucher.employee_name || '-'}</td>
                        <td>{voucher.summer_voucher_serial_number || '-'}</td>
                        <td>{convertToUIDateFormat(voucher.modified_at)}</td>
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
    );
};

export default ApplicationTable;
