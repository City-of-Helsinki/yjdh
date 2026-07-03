import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import fi from '../../../../public/locales/fi/common.json';
import LinkedEmployerApplications from '../LinkedEmployerApplications';

const mockApplications = [
  {
    id: 'emp-1',
    company_name: 'Test Oy',
    company_business_id: '1234567-8',
    summer_voucher_serial_number: '12345',
    submitted_at: '2024-05-10',
  },
];

describe('LinkedEmployerApplications', () => {
  it('renders nothing when no employer applications given', () => {
    const {
      renderResult: { container },
    } = renderComponent(
      <LinkedEmployerApplications employerApplications={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders employer application links when data is present', () => {
    renderComponent(
      <LinkedEmployerApplications employerApplications={mockApplications} />
    );
    expect(
      screen.getByText(fi.handlerApplication.employerApplicationsTitle)
    ).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/employer-applications/emp-1');
    expect(link).toHaveTextContent('Test Oy');
    expect(link).toHaveTextContent('10.5.2024');
  });
});
