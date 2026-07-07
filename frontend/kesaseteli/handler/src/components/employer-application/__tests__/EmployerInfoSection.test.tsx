import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import EmployerInfoSection from '../EmployerInfoSection';
import { mockApplicationSingleVoucher } from '../fixtures';

describe('EmployerInfoSection', () => {
  it('renders company name and business_id', () => {
    renderComponent(
      <EmployerInfoSection application={mockApplicationSingleVoucher} />
    );
    expect(screen.getByText('Testiyritys Oy')).toBeInTheDocument();
    expect(screen.getByText('1234567-8')).toBeInTheDocument();
    expect(screen.getByText(/Palvelut/)).toBeInTheDocument();
    expect(screen.getByText(/oy/)).toBeInTheDocument();
  });

  it('shows invoicer section', () => {
    renderComponent(
      <EmployerInfoSection
        application={{
          ...mockApplicationSingleVoucher,
          invoicer_name: 'Matti Meikäläinen',
        }}
      />
    );
    expect(screen.getByText(/laskuttajan nimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Matti Meikäläinen/)).toBeInTheDocument();
  });

  it('hides foreign IBAN fields when all are empty', () => {
    renderComponent(
      <EmployerInfoSection application={mockApplicationSingleVoucher} />
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
      />
    );
    expect(screen.getByText(/maksunsaajan nimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ulkomainen Yritys/)).toBeInTheDocument();
  });

  it('renders submitted_at as Finnish locale date', () => {
    renderComponent(
      <EmployerInfoSection application={mockApplicationSingleVoucher} />
    );
    // application.submitted_at = '2024-05-15'
    expect(screen.getByText(/15\.5\.2024/)).toBeInTheDocument();
  });

  it('hides voucher section when voucher prop is omitted', () => {
    renderComponent(
      <EmployerInfoSection application={mockApplicationSingleVoucher} />
    );
    expect(
      screen.queryByText(/kesäsetelin sarjanumero/i)
    ).not.toBeInTheDocument();
  });
});
