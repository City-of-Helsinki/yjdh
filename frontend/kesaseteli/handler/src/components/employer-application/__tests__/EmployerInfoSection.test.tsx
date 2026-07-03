import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import EmployerInfoSection from '../EmployerInfoSection';
import { mockApplicationSingleVoucher, mockVoucher1 } from '../fixtures';

describe('EmployerInfoSection', () => {
  it('renders company name and business_id', () => {
    renderComponent(
      <EmployerInfoSection
        application={mockApplicationSingleVoucher}
        voucher={mockVoucher1}
      />
    );
    expect(screen.getByText('Testiyritys Oy - 1234567-8')).toBeInTheDocument();
    expect(screen.getByText(/Palvelut/)).toBeInTheDocument();
    expect(screen.getByText(/oy/)).toBeInTheDocument();
  });

  it('hides invoicer section when is_separate_invoicer is false', () => {
    renderComponent(
      <EmployerInfoSection
        application={{
          ...mockApplicationSingleVoucher,
          is_separate_invoicer: false,
        }}
        voucher={mockVoucher1}
      />
    );
    expect(screen.queryByText(/laskuttajan nimi/i)).not.toBeInTheDocument();
  });

  it('shows invoicer section when is_separate_invoicer is true', () => {
    renderComponent(
      <EmployerInfoSection
        application={{
          ...mockApplicationSingleVoucher,
          is_separate_invoicer: true,
          invoicer_name: 'Matti Meikäläinen',
        }}
        voucher={mockVoucher1}
      />
    );
    expect(screen.getByText(/laskuttajan nimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Matti Meikäläinen/)).toBeInTheDocument();
  });

  it('hides foreign IBAN fields when all are empty', () => {
    renderComponent(
      <EmployerInfoSection
        application={mockApplicationSingleVoucher}
        voucher={mockVoucher1}
      />
    );
    expect(screen.queryByText(/maksunsaajan nimi/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/pankin swift \/ bic koodi/i)
    ).not.toBeInTheDocument();
  });

  it('shows foreign IBAN fields when payee_name is non-empty', () => {
    renderComponent(
      <EmployerInfoSection
        application={{
          ...mockApplicationSingleVoucher,
          payee_name: 'Ulkomainen Yritys',
        }}
        voucher={mockVoucher1}
      />
    );
    expect(screen.getByText(/maksunsaajan nimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ulkomainen Yritys/)).toBeInTheDocument();
  });

  it('renders submitted_at as Finnish locale date', () => {
    renderComponent(
      <EmployerInfoSection
        application={mockApplicationSingleVoucher}
        voucher={mockVoucher1}
      />
    );
    // application.submitted_at = '2024-05-15'
    expect(screen.getByText(/15\.5\.2024/)).toBeInTheDocument();
  });
});
