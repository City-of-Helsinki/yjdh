import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import React from 'react';

import EmployerActionButtons from '../EmployerActionButtons';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockMutate = jest.fn();
jest.mock(
  'kesaseteli/handler/hooks/backend/useCompleteEmployerApplicationQuery',
  () => ({
    __esModule: true,
    default: () => ({
      isPending: false,
      mutate: mockMutate,
    }),
  })
);

const mockConfirm = jest.fn();
jest.mock('shared/hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

const mockUseAssignee = jest.fn();
jest.mock('kesaseteli/handler/hooks/useAssignee', () => ({
  __esModule: true,
  default: () => mockUseAssignee(),
}));

describe('EmployerActionButtons', () => {
  const queryClient = new QueryClient();
  const mockApplication = {
    id: 'test-app-id',
    assignee: { name: 'Test User' },
  } as unknown as HandlerEmployerApplication;

  const renderComponent = (): void => {
    render(
      <QueryClientProvider client={queryClient}>
        <EmployerActionButtons application={mockApplication} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and buttons are disabled if not assignee', () => {
    mockUseAssignee.mockReturnValue({ isAssignee: false });
    renderComponent();

    expect(
      screen.getByText('common:handlerApplication.actionsTitle')
    ).toBeInTheDocument();

    const acceptBtn = screen.getByRole('button', {
      name: /common:handlerapplication.accept/i,
    });
    const rejectBtn = screen.getByRole('button', {
      name: /common:handlerapplication.reject/i,
    });

    expect(acceptBtn).toBeDisabled();
    expect(rejectBtn).toBeDisabled();
  });

  it('buttons are enabled if user is assignee', () => {
    mockUseAssignee.mockReturnValue({ isAssignee: true });
    renderComponent();

    const acceptBtn = screen.getByRole('button', {
      name: /common:handlerapplication.accept/i,
    });
    expect(acceptBtn).toBeEnabled();
  });

  it('calls confirm and mutate on accept', async () => {
    mockUseAssignee.mockReturnValue({ isAssignee: true });
    mockConfirm.mockResolvedValue(true);

    renderComponent();
    fireEvent.click(
      screen.getByRole('button', { name: /common:handlerapplication.accept/i })
    );

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'common:dialog.accept.title',
      })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ type: 'accept' });
    });
  });

  it('calls confirm and mutate on reject', async () => {
    mockUseAssignee.mockReturnValue({ isAssignee: true });
    mockConfirm.mockResolvedValue(true);

    renderComponent();
    fireEvent.click(
      screen.getByRole('button', { name: /common:handlerapplication.reject/i })
    );

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'common:dialog.reject.title',
      })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ type: 'reject' });
    });
  });
});
