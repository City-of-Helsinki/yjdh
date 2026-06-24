import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationList from 'benefit/handler/components/alterationList/AlterationList';
import { ROUTES } from 'benefit/handler/constants';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import React from 'react';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): React.ReactElement {
      return <div data-testid="loading-skeleton" />;
    }
);

const alteration = {
  id: 11,
  application: 'app-1',
  alteration_type: ALTERATION_TYPE.SUSPENSION,
  created_at: '2024-01-10',
  end_date: '2024-01-31',
  resume_date: '2024-02-15',
  application_company_name: 'Yritys Oy',
  application_number: 42,
  application_employee_first_name: 'Matti',
  application_employee_last_name: 'Meikäläinen',
} as ApplicationAlterationData;

const renderSubject = ({
  isLoading = false,
  list = [],
}: {
  isLoading?: boolean;
  list?: Array<ApplicationAlterationData>;
} = {}): RenderResult =>
  renderComponent(<AlterationList isLoading={isLoading} list={list} />)
    .renderResult;

describe('AlterationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons while loading', () => {
    renderSubject({ isLoading: true, list: [alteration] });

    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(2);
    expect(screen.queryByTestId('alteration-list')).not.toBeInTheDocument();
  });

  it('renders empty state when there are no alterations', () => {
    renderSubject({ isLoading: false, list: [] });

    expect(screen.getByTestId('alteration-list')).toBeInTheDocument();
    expect(
      screen.getByText('Ei yhtään saapunutta muutosilmoitusta.')
    ).toBeInTheDocument();
  });

  it('renders alteration row data and applicant link', () => {
    renderSubject({ list: [alteration] });

    expect(screen.getByText('Yritys Oy')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('10.1.2024')).toBeInTheDocument();
    expect(screen.getByText('Matti Meikäläinen')).toBeInTheDocument();

    const applicantLink = screen.getByRole('link', { name: 'Yritys Oy' });
    expect(applicantLink).toHaveAttribute(
      'href',
      `${ROUTES.APPLICATION}/?id=app-1`
    );
  });

  it('routes to handling view when start handling action is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderSubject({ list: [alteration] });
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Käsittele',
      })
    );

    expect(mockPush).toHaveBeenCalledWith(
      `${ROUTES.HANDLE_ALTERATION}/?applicationId=app-1&alterationId=11`
    );
  });
});
