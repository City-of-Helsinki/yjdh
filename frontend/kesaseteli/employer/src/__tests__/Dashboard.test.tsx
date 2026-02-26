import { render, RenderResult, screen } from '@testing-library/react';
import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import theme from 'shared/styles/theme';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { ThemeProvider } from 'styled-components';

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        asPath: '/',
        locale: 'fi',
        query: {},
    }),
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useLocale', () => () => 'fi');

const mockVouchers: DashboardVoucher[] = [
    {
        id: 'v1',
        employee_name: 'Testi Teppo',
        summer_voucher_serial_number: '123456',
        applicationId: 'app1',
        applicationStatus: 'submitted',
        modified_at: '2026-02-26T10:00:00Z',
    } as Partial<DashboardVoucher> as DashboardVoucher,
];

const [voucher1] = mockVouchers;

const renderWithProviders = (vouchers: DashboardVoucher[]): RenderResult => {
    const queryClient = new QueryClient();
    return render(
        <BackendAPIProvider baseURL={getBackendDomain()}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <Dashboard vouchers={vouchers} />
                </ThemeProvider>
            </QueryClientProvider>
        </BackendAPIProvider>
    );
};

describe('Dashboard', () => {
    it('renders the dashboard title and intro text', () => {
        renderWithProviders([]);
        expect(screen.getByText('Kesäseteli - Työnantajaportaali')).toBeInTheDocument();
        expect(screen.getByText(/Tervetuloa kesäsetelin työnantajaportaaliin/)).toBeInTheDocument();
    });

    it('renders the create application button', () => {
        renderWithProviders([]);
        expect(screen.getByRole('button', { name: /tee uusi hakemus/i })).toBeInTheDocument();
    });

    it('renders "Ei aiempia hakemuksia" when list is empty', () => {
        renderWithProviders([]);
        expect(screen.getByText(/ei aiempia hakemuksia/i)).toBeInTheDocument();
    });

    it('renders vouchers in the table', () => {
        renderWithProviders(mockVouchers);
        expect(screen.getByText(voucher1.employee_name)).toBeInTheDocument();
        expect(screen.getByText(voucher1.summer_voucher_serial_number)).toBeInTheDocument();
        expect(screen.getByText(convertToUIDateFormat(voucher1.modified_at))).toBeInTheDocument();
        // Status label renders the i18n translation
        expect(screen.getByText('Lähetetty')).toBeInTheDocument();
    });
});
