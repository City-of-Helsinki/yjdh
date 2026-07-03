import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import EmployerApplicationHandlerView from '../EmployerApplicationHandlerView';
import {
  mockApplicationSingleVoucher,
  mockApplicationTwoVouchers,
} from '../fixtures';

describe('EmployerApplicationHandlerView', () => {
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

  it('renders safely when summer_vouchers array is empty', () => {
    const emptyVouchersApp = {
      ...mockApplicationSingleVoucher,
      summer_vouchers: [],
    };
    renderComponent(
      <EmployerApplicationHandlerView application={emptyVouchersApp} />
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
});
