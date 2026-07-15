import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import EmployerApplicationHandlerView from '../EmployerApplicationHandlerView';
import {
  mockApplicationSingleVoucher,
  mockApplicationTwoVouchers,
} from '../fixtures';

describe('EmployerApplicationHandlerView', () => {
  let matchMediaMatches = false;
  const WARNING_NOTIFICATION_REGEX =
    /tähän hakemukseen on poikkeuksellisesti liitetty useita kesäseteleitä/i;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: matchMediaMatches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    matchMediaMatches = false;
  });

  it('renders the warning notification as non-dismissible and inline by default on desktop', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationTwoVouchers}
      />
    );
    expect(screen.getByText(WARNING_NOTIFICATION_REGEX)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /sulje/i })
    ).not.toBeInTheDocument();
  });

  it('renders the warning notification as dismissible on mobile and can dismiss it', async () => {
    matchMediaMatches = true;
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationTwoVouchers}
      />
    );
    expect(screen.getByText(WARNING_NOTIFICATION_REGEX)).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /sulje/i });
    expect(closeBtn).toBeInTheDocument();

    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(
        screen.queryByText(WARNING_NOTIFICATION_REGEX)
      ).not.toBeInTheDocument();
    });
  });

  it('renders both sections without tab chrome when there is one voucher', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByText(/testiyritys oy/i)).toBeInTheDocument();
    expect(screen.getByText(/nuoren tiedot/i)).toBeInTheDocument();
  });

  it('renders tabs when there are multiple vouchers (legacy data)', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationTwoVouchers}
      />
    );
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(
      screen.getByRole('tab', { name: /kesäseteli 1/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /kesäseteli 2/i })
    ).toBeInTheDocument();
    // Assert company name is rendered (outside tabs)
    expect(screen.getByText(/testiyritys oy/i)).toBeInTheDocument();
  });

  it('shows the first voucher panel by default and switches on tab click', async () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationTwoVouchers}
      />
    );

    // first voucher serial number is visible
    expect(screen.getByText(/SN-001/)).toBeInTheDocument();
    expect(screen.queryByText(/SN-002/)).not.toBeInTheDocument();

    // click second tab
    await userEvent.click(screen.getByRole('tab', { name: /kesäseteli 2/i }));

    // second voucher serial number is visible
    expect(screen.getByText(/SN-002/)).toBeInTheDocument();
    expect(screen.queryByText(/SN-001/)).not.toBeInTheDocument();
  });

  it('renders company details', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.getByText('Testiyritys Oy')).toBeInTheDocument();
    expect(screen.getByText('1234567-8')).toBeInTheDocument();
    expect(screen.getByText(/Palvelut/)).toBeInTheDocument();
    expect(screen.getByText(/oy/)).toBeInTheDocument();
  });

  it('renders contact person and payment details', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.getByText('Testi Henkilö')).toBeInTheDocument();
    expect(screen.getByText('testi@yritys.fi')).toBeInTheDocument();
    expect(screen.getByText('0401112222')).toBeInTheDocument();
    expect(screen.getByText('FI12 3456 7890 1234 56')).toBeInTheDocument();
  });

  it('renders invoicer details', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={{
          ...mockApplicationSingleVoucher,
          invoicer_name: 'Matti Meikäläinen',
          invoicer_email: 'matti@laskutus.fi',
          invoicer_phone_number: '0505556666',
        }}
      />
    );
    expect(
      screen.getByTestId('handlerApplication-invoicer_name')
    ).toHaveTextContent('Matti Meikäläinen');
    expect(
      screen.getByTestId('handlerApplication-invoicer_email')
    ).toHaveTextContent('matti@laskutus.fi');
    expect(
      screen.getByTestId('handlerApplication-invoicer_phone_number')
    ).toHaveTextContent('0505556666');
  });

  it('hides foreign IBAN fields when all are empty', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.queryByText(/maksunsaajan nimi/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/pankin swift \/ bic koodi/i)
    ).not.toBeInTheDocument();
  });

  it('shows foreign IBAN fields when payee_name is non-empty', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={{
          ...mockApplicationSingleVoucher,
          payee_name: 'Ulkomainen Yritys',
          bank_swift_bic_code: 'SWIFT123',
        }}
      />
    );
    expect(screen.getByText(/maksunsaajan nimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ulkomainen Yritys/)).toBeInTheDocument();
    expect(screen.getByText(/pankin swift \/ bic koodi/i)).toBeInTheDocument();
    expect(screen.getByText(/SWIFT123/)).toBeInTheDocument();
  });

  it('renders submitted_at as Finnish locale date', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.getByText(/15\.5\.2024/)).toBeInTheDocument();
  });

  it('renders a fallback placeholder when there are no vouchers', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [],
        }}
      />
    );
    expect(screen.getByTestId('no-vouchers')).toBeInTheDocument();
  });

  it('renders youth/student details', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(
      screen.getByTestId('handlerApplication-employee_name')
    ).toHaveTextContent('Maija Meikäläinen');
    expect(
      screen.getByTestId('handlerApplication-employee_birthdate')
    ).toHaveTextContent('1.5.2006');
    expect(
      screen.getByTestId('handlerApplication-employee_school')
    ).toHaveTextContent('Helsingin lukio');
    expect(
      screen.getByTestId('handlerApplication-employee_phone_number')
    ).toHaveTextContent('0401234567');
    expect(
      screen.getByTestId('handlerApplication-employee_home_city')
    ).toHaveTextContent('Helsinki');
    expect(
      screen.getByTestId('handlerApplication-employee_postcode')
    ).toHaveTextContent('00100');
    expect(
      screen.getByRole('link', { name: /avaa nuoren hakemus/i })
    ).toHaveAttribute('href', '/youth-applications/youth-app-1');
  });

  it('renders voucher details', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(
      screen.getByTestId('handlerApplication-summer_voucher_serial_number')
    ).toHaveTextContent('SN-001');
    expect(
      screen.getByTestId('handlerApplication-employment_period')
    ).toHaveTextContent('1.6.2024 – 30.6.2024');
    expect(
      screen.getByTestId('handlerApplication-employment_work_hours')
    ).toHaveTextContent('60');
    expect(
      screen.getByTestId('handlerApplication-employment_salary_paid')
    ).toHaveTextContent('500 €');
    expect(
      screen.getByTestId('handlerApplication-employment_description')
    ).toHaveTextContent('Siivoustehtäviä');
    expect(
      screen.getByTestId('handlerApplication-hired_without_voucher_assessment')
    ).toHaveTextContent(/kyllä/i);
  });

  it('renders voucher attachments when present', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              employment_contract: [
                {
                  id: 'attachment-1',
                  attachment_file_name: 'sopimus.pdf',
                  application: 'app-1',
                  attachment_type: 'employment_contract',
                  content_type: 'application/pdf',
                  summer_voucher: 'voucher-1',
                },
              ],
              payslip: [
                {
                  id: 'attachment-2',
                  attachment_file_name: 'palkkakuitti.pdf',
                  application: 'app-1',
                  attachment_type: 'payslip',
                  content_type: 'application/pdf',
                  summer_voucher: 'voucher-1',
                },
              ],
            },
          ],
        }}
      />
    );
    expect(screen.getByText('sopimus.pdf')).toBeInTheDocument();
    expect(screen.getByText('palkkakuitti.pdf')).toBeInTheDocument();
  });
});
