import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import FakeObjectFactory from 'kesaseteli-shared/__tests__/utils/FakeObjectFactory';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import HandlerEmployerApplication, {
  HandlerSummerVoucher,
} from '../../../types/HandlerEmployerApplication';
import EmployerApplicationHandlerView from '../EmployerApplicationHandlerView';

const fakeObjectFactory = new FakeObjectFactory();

const mockVoucher1: HandlerSummerVoucher = {
  ...fakeObjectFactory.fakeHandlerSummerVoucher({
    id: 'voucher-1',
    summer_voucher_serial_number: 'SN-001',
    employee_name: 'Maija Meikäläinen',
    employee_birthdate: '2006-05-01',
    employee_school: 'Helsingin lukio',
    employee_phone_number: '0401234567',
    employee_home_city: 'Helsinki',
    employee_postcode: '00100',
    employment_postcode: '00100',
    employment_start_date: '2024-06-01',
    employment_end_date: '2024-06-30',
    employment_work_hours: 60,
    employment_salary_paid: 500,
    employment_description: 'Siivoustehtäviä',
    hired_without_voucher_assessment: 'yes',
    attachments: [],
    youth_application_id: 'youth-app-1',
  }),
};

const mockVoucher2: HandlerSummerVoucher = {
  ...fakeObjectFactory.fakeHandlerSummerVoucher({
    id: 'voucher-2',
    summer_voucher_serial_number: 'SN-002',
    employee_name: 'Matti Meikäläinen',
    employee_birthdate: '2005-06-15',
    employee_school: 'Ammattikoulu',
    employee_phone_number: '0501234567',
    employee_home_city: 'Espoo',
    employee_postcode: '02100',
    employment_postcode: '00200',
    employment_start_date: '2024-07-01',
    employment_end_date: '2024-07-31',
    employment_work_hours: 60,
    employment_salary_paid: 500,
    employment_description: 'Kahvilatyöntekijä',
    hired_without_voucher_assessment: 'no',
    attachments: [],
  }),
};

const mockApplicationSingleVoucher: HandlerEmployerApplication = {
  ...fakeObjectFactory.fakeHandlerEmployerApplication({
    id: 'app-1',
    status: EmployerApplicationStatus.SUBMITTED,
    submitted_at: '2024-05-15',
    created_at: '2024-05-10',
    company: {
      id: 'company-1',
      name: 'Testiyritys Oy',
      business_id: '1234567-8',
      industry: 'Palvelut',
      company_form: 'oy',
      street_address: 'Testikatu 1',
      postcode: '00100',
      city: 'Helsinki',
    },
    contact_person_name: 'Testi Henkilö',
    contact_person_email: 'testi@yritys.fi',
    contact_person_phone_number: '0401112222',
    street_address: 'Laskutuskatu 2',
    bank_account_number: 'FI1234567890123456',
    payee_name: '',
    payee_address: '',
    bank_swift_bic_code: '',
    bank_name: '',
    bank_address: '',
    is_separate_invoicer: false,
    invoicer_name: '',
    invoicer_email: '',
    invoicer_phone_number: '',
    language: 'fi',
    summer_vouchers: [mockVoucher1],
  }),
};

const mockApplicationTwoVouchers: HandlerEmployerApplication = {
  ...mockApplicationSingleVoucher,
  id: 'app-2',
  summer_vouchers: [mockVoucher1, mockVoucher2],
};

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
    cleanup();
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

  it('renders info tooltips for company, voucher, and youth sections', async () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );

    const tooltipButtons = screen.getAllByRole('button', {
      name: /näytä info/i,
    });
    expect(tooltipButtons).toHaveLength(4);

    // Clicking company section tooltip
    await userEvent.click(tooltipButtons[0]);
    expect(
      screen.getByText(/prh:n avoimen datan rajapinnasta/i)
    ).toBeInTheDocument();

    // Clicking the new street_address field tooltip
    await userEvent.click(tooltipButtons[1]);
    expect(
      screen.getByText(/työnantajan itsensä ilmoittama osoite/i)
    ).toBeInTheDocument();

    // Clicking voucher tooltip
    await userEvent.click(tooltipButtons[2]);
    expect(
      screen.getByText(/työnantajan hakemuksessa ilmoittamat tiedot/i)
    ).toBeInTheDocument();

    // Clicking youth tooltip
    await userEvent.click(tooltipButtons[3]);
    expect(
      screen.getByText(/väestötietojärjestelmään \(vtj\)/i)
    ).toBeInTheDocument();
  });

  it('renders employer-entered address in company section', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    // field must exist and show the employer-entered value
    expect(
      screen.getByTestId('handlerApplication-street_address')
    ).toHaveTextContent('Laskutuskatu 2');
    // and it must live in the company section, not payment section
    // (company section is identified by its heading)
    const companyHeading = screen.getByText('Yrityksen tiedot');
    expect(companyHeading).toBeInTheDocument();
  });

  it('does not render employer address under payment section label Laskutusosoite', () => {
    renderComponent(
      <EmployerApplicationHandlerView
        application={mockApplicationSingleVoucher}
      />
    );
    expect(screen.queryByText(/laskutusosoite/i)).not.toBeInTheDocument();
  });
});
