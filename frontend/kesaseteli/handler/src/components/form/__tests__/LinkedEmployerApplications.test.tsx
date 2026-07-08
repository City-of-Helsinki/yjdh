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

  it('renders a single employer application link with singular title and description', () => {
    renderComponent(
      <LinkedEmployerApplications employerApplications={mockApplications} />
    );
    expect(
      screen.getByText(fi.handlerApplication.employerApplicationTitleLinked)
    ).toBeInTheDocument();
    expect(
      screen.getByText(fi.handlerApplication.employerApplicationDescription)
    ).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/employer-applications/emp-1');
    expect(link).toHaveTextContent('Test Oy');
    expect(link).toHaveTextContent('10.5.2024');
  });

  it('renders multiple employer application links with plural title and description', () => {
    const multipleMocks = [
      ...mockApplications,
      {
        id: 'emp-2',
        company_name: 'Example Oy',
        company_business_id: '7654321-0',
        summer_voucher_serial_number: '54321',
        submitted_at: '2024-06-15',
      },
    ];
    renderComponent(
      <LinkedEmployerApplications employerApplications={multipleMocks} />
    );
    expect(
      screen.getByText(fi.handlerApplication.employerApplicationsTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByText(fi.handlerApplication.employerApplicationsDescription)
    ).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/employer-applications/emp-1');
    expect(links[1]).toHaveAttribute('href', '/employer-applications/emp-2');
  });
});
