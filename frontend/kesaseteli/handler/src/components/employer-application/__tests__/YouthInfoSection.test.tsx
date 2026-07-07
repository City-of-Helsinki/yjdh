import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import { mockVoucher1 } from '../fixtures';
import YouthInfoSection from '../YouthInfoFieldsSection';

describe('YouthInfoSection', () => {
  it('renders all employee fields', () => {
    renderComponent(<YouthInfoSection voucher={mockVoucher1} />);

    expect(screen.getByText(/Maija Meikäläinen/)).toBeInTheDocument();
    expect(screen.getByText(/Helsingin lukio/)).toBeInTheDocument();
    expect(screen.getByText(/0401234567/)).toBeInTheDocument();
    expect(screen.getByText(/Helsinki/)).toBeInTheDocument();
    expect(screen.getByText(/00100/)).toBeInTheDocument();
  });

  it('renders birthdate in Finnish locale format', () => {
    renderComponent(<YouthInfoSection voucher={mockVoucher1} />);
    // employee_birthdate = '2006-05-01'
    expect(screen.getByText(/1\.5\.2006/)).toBeInTheDocument();
  });

  it('shows youth application link when youth_application_id is present', () => {
    renderComponent(<YouthInfoSection voucher={mockVoucher1} />);
    expect(
      screen.getByRole('link', { name: /avaa nuoren hakemus/i })
    ).toBeInTheDocument();
  });

  it('hides youth application link when youth_application_id is empty', () => {
    renderComponent(
      <YouthInfoSection
        voucher={{ ...mockVoucher1, youth_application_id: undefined }}
      />
    );
    expect(
      screen.queryByRole('link', { name: /avaa nuoren hakemus/i })
    ).not.toBeInTheDocument();
  });
});
