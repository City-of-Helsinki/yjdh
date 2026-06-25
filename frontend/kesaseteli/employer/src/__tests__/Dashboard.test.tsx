import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

const mockPush = jest.fn();
const mockMutate = jest.fn();
const mockErrorHandler = jest.fn();
const routerMock = {
  push: mockPush,
  asPath: '/',
  locale: 'fi',
  query: {},
};

jest.mock('next/router', () => ({
  useRouter: () => routerMock,
}));

jest.mock('kesaseteli/employer/hooks/backend/useCreateApplicationQuery', () =>
  jest.fn()
);

jest.mock('shared/hooks/useErrorHandler', () => jest.fn());

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useLocale', () => () => 'fi');

const mockVouchers: DashboardVoucher[] = [
  {
    id: 'v1',
    employee_name: 'Testi Teppo',
    summer_voucher_serial_number: '123456',
    applicationId: 'app1',
    applicationStatus: 'submitted',
    modified_at: '2026-02-26T10:00:00Z',
  } as Partial<DashboardVoucher> as DashboardVoucher,
];

const [voucher1] = mockVouchers;

const getCreateApplicationButton = (): HTMLElement =>
  screen.getByRole('button', { name: /tee uusi hakemus/i });

type RenderOptions = {
  vouchers?: DashboardVoucher[];
  organisationName?: string;
  draftApplicationId?: string;
};

type SetupOptions = RenderOptions & {
  isCreateLoading?: boolean;
  mutateImplementation?: (
    variables: undefined,
    options: { onSuccess?: (data: { id: string }) => void }
  ) => void;
};

const renderWithProviders = ({
  vouchers = [],
  organisationName,
  draftApplicationId,
}: RenderOptions = {}): void => {
  renderComponent(
    <Dashboard
      vouchers={vouchers}
      showOnlyMine={false}
      onToggleOnlyMine={jest.fn()}
      organisationName={organisationName}
      draftApplicationId={draftApplicationId}
    />
  );
};

const setupDashboard = ({
  isCreateLoading = false,
  mutateImplementation,
  ...renderOptions
}: SetupOptions = {}): {
  user: ReturnType<typeof userEvent.setup>;
} => {
  (useCreateApplicationQuery as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: isCreateLoading,
  });

  if (mutateImplementation) {
    mockMutate.mockImplementation(mutateImplementation);
  }

  renderWithProviders(renderOptions);
  return { user: userEvent.setup() };
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorHandler as jest.Mock).mockReturnValue(mockErrorHandler);
  });

  it('renders the dashboard title and intro text', () => {
    setupDashboard();
    expect(
      screen.getByRole('heading', { name: 'Työnantajan kesäsetelihakemukset' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tervetuloa työnantajien Kesäseteli-asiointipalveluun/)
    ).toBeInTheDocument();
  });

  it('renders the create application button', () => {
    setupDashboard();
    expect(getCreateApplicationButton()).toBeInTheDocument();
  });

  it('renders "Ei aiempia hakemuksia" when list is empty', () => {
    setupDashboard();
    expect(screen.getByText(/ei aiempia hakemuksia/i)).toBeInTheDocument();
  });

  it('renders vouchers in the table', () => {
    setupDashboard({ vouchers: mockVouchers });
    expect(screen.getByText(voucher1.employee_name ?? '')).toBeInTheDocument();
    expect(
      screen.getByText(voucher1.summer_voucher_serial_number)
    ).toBeInTheDocument();
    expect(
      screen.getByText(convertToUIDateAndTimeFormat(voucher1.modified_at))
    ).toBeInTheDocument();
    // Status label renders the i18n translation
    expect(screen.getByText('Lähetetty')).toBeInTheDocument();
  });

  it('renders the organisation name text when organisationName prop is provided', () => {
    setupDashboard({ organisationName: 'Testiyritys Oy' });
    expect(
      screen.getByText('Asioit organisaation Testiyritys Oy puolesta.')
    ).toBeInTheDocument();
  });

  it('does not render the organisation name element when organisationName is not provided', () => {
    setupDashboard();
    expect(screen.queryByText(/asioit organisaation/i)).not.toBeInTheDocument();
  });

  it('navigates to existing draft when create button is clicked', async () => {
    const { user } = setupDashboard({ draftApplicationId: 'draft-123' });

    await user.click(getCreateApplicationButton());

    expect(mockPush).toHaveBeenCalledWith('/fi/application?id=draft-123');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('creates new application and navigates to created application id', async () => {
    const { user } = setupDashboard({
      mutateImplementation: (_variables, options) => {
        options.onSuccess?.({ id: 'new-app-id' });
      },
    });

    await user.click(getCreateApplicationButton());

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        onError: mockErrorHandler,
        onSuccess: expect.any(Function),
      })
    );
    expect(mockPush).toHaveBeenCalledWith('/fi/application?id=new-app-id');
  });
});
