import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';
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

jest.mock('kesaseteli/employer/hooks/backend/useApplicationsQuery', () =>
  jest.fn()
);

jest.mock('shared/hooks/useErrorHandler', () => jest.fn());

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useLocale', () => () => 'fi');

const mockApplications: Application[] = [
  {
    id: 'app1',
    status: 'submitted',
    modified_at: '2026-02-26T10:00:00Z',
    summer_vouchers: [
      {
        id: 'v1',
        employee_name: 'Testi Teppo',
        summer_voucher_serial_number: '123456',
      },
    ],
  } as unknown as Application,
];

const [app1] = mockApplications;

const getCreateApplicationButton = (): HTMLElement =>
  screen.getByRole('button', { name: /tee uusi hakemus/i });

type RenderOptions = {
  applications?: Application[];
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
  applications = [],
  organisationName,
  draftApplicationId,
}: RenderOptions = {}): void => {
  (useApplicationsQuery as jest.Mock).mockImplementation(
    (options?: { limit?: number; offset?: number; onlyMine?: boolean }) => {
      if (
        options &&
        options.limit !== undefined &&
        options.offset !== undefined
      ) {
        const { limit, offset } = options;
        return {
          data: {
            count: applications.length,
            results: applications.slice(offset, offset + limit),
          },
          isLoading: false,
          error: null,
        };
      }
      return {
        data: applications,
        isLoading: false,
        error: null,
      };
    }
  );

  renderComponent(
    <Dashboard
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
    isLoading: isCreateLoading,
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
    setupDashboard({ applications: mockApplications });
    const voucher = app1.summer_vouchers[0];
    expect(screen.getByText(voucher.employee_name ?? '')).toBeInTheDocument();
    expect(
      screen.getByText(voucher.summer_voucher_serial_number)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        convertToUIDateAndTimeFormat(
          (app1 as typeof app1 & { modified_at?: string }).modified_at || ''
        )
      )
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
