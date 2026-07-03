import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import fi from '../../../../public/locales/fi/common.json';
import { ApplicationStatus } from '../../../types/application';
import ApplicationListTable, { HdsHeader } from '../ApplicationListTable';

const mockColumns: HdsHeader[] = [
  { key: 'name', headerName: 'Nimi', isSortable: false },
  { key: 'status', headerName: 'Tila', isSortable: true },
];
const mockData = [
  { id: 'row-1', status: ApplicationStatus.SUBMITTED },
  { id: 'row-2', status: ApplicationStatus.ACCEPTED },
];

describe('ApplicationListTable', () => {
  it('shows loading spinner when isLoading is true', () => {
    renderComponent(
      <ApplicationListTable
        columns={mockColumns}
        data={[]}
        totalCount={0}
        page={0}
        setPage={jest.fn()}
        setOrdering={jest.fn()}
        isLoading
      />
    );
    expect(screen.getByTestId('page-loading-spinner')).toBeInTheDocument();
  });

  it('shows no-applications text when data is empty and not loading', () => {
    renderComponent(
      <ApplicationListTable
        columns={mockColumns}
        data={[]}
        totalCount={0}
        page={0}
        setPage={jest.fn()}
        setOrdering={jest.fn()}
        isLoading={false}
      />
    );
    expect(
      screen.getByText(fi.applicationList.noApplications)
    ).toBeInTheDocument();
  });

  it('does not render pagination when totalCount <= 20', () => {
    const setPage = jest.fn();
    renderComponent(
      <ApplicationListTable
        columns={mockColumns}
        data={mockData}
        totalCount={20}
        page={0}
        setPage={setPage}
        setOrdering={jest.fn()}
        isLoading={false}
      />
    );
    // Pagination is only rendered when pageCount > 1
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders pagination when totalCount > 20', () => {
    renderComponent(
      <ApplicationListTable
        columns={mockColumns}
        data={mockData}
        totalCount={21}
        page={0}
        setPage={jest.fn()}
        setOrdering={jest.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
