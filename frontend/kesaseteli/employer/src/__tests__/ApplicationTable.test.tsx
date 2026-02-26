import { render, RenderResult, screen } from '@testing-library/react';
import ApplicationTable from 'kesaseteli/employer/components/dashboard/ApplicationTable';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import React from 'react';
import theme from 'shared/styles/theme';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { ThemeProvider } from 'styled-components';

const mockVouchers: DashboardVoucher[] = [
    {
        id: 'v1',
        employee_name: 'Testi Teppo',
        summer_voucher_serial_number: '123456',
        applicationId: 'app1',
        applicationStatus: 'submitted',
        modified_at: '2026-02-26T10:00:00Z',
    } as Partial<DashboardVoucher> as DashboardVoucher,
    {
        id: 'v2',
        employee_name: 'Matti Meikäläinen',
        summer_voucher_serial_number: '654321',
        applicationId: 'app2',
        applicationStatus: 'draft',
        modified_at: '2026-02-25T12:00:00Z',
    } as Partial<DashboardVoucher> as DashboardVoucher,
];

const renderWithTheme = (vouchers: DashboardVoucher[]): RenderResult => render(
    <ThemeProvider theme={theme}>
        <ApplicationTable vouchers={vouchers} />
    </ThemeProvider>
);

afterEach(() => {
    jest.clearAllMocks();
});

describe('ApplicationTable', () => {
    it('renders all columns', () => {
        renderWithTheme([]);
        expect(screen.getByText('Työntekijän nimi')).toBeInTheDocument();
        expect(screen.getByText('Kesäsetelin sarjanumero')).toBeInTheDocument();
        expect(screen.getByText('Viimeksi päivitetty')).toBeInTheDocument();
        expect(screen.getByText('Tila')).toBeInTheDocument();
    });

    it('renders voucher data correctly', () => {
        const translations: Record<string, string> = {
            'submitted': 'Lähetetty',
            'draft': 'Luonnos',
        }
        renderWithTheme(mockVouchers);
        // expect(screen.getByText('Aiemmat kesäsetelihakemukset')).toBeInTheDocument();
        for (const voucher of mockVouchers) {
            expect(screen.getByText(voucher.employee_name)).toBeInTheDocument();
            expect(screen.getByText(voucher.summer_voucher_serial_number)).toBeInTheDocument();
            expect(screen.getByText(convertToUIDateFormat(voucher.modified_at))).toBeInTheDocument();
            expect(screen.getByText(translations[voucher.applicationStatus])).toBeInTheDocument();
        }
    });

    it('shows empty message when no vouchers', () => {
        renderWithTheme([]);
        expect(screen.getByText(/ei aiempia hakemuksia/i)).toBeInTheDocument();
    });
});
