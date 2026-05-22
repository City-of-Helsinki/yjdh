import { renderHook, waitFor } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { RemoveAttachmentData } from 'shared/types/attachment';

import useRemoveAttachmentQuery from '../useRemoveAttachmentQuery';

jest.mock('shared/hooks/useBackendAPI');

const mockAxiosDelete = jest.fn();
const mockHandleResponse = jest.fn();
const mockUseBackendAPI = useBackendAPI as jest.MockedFunction<
  typeof useBackendAPI
>;

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }): JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRemoveAttachmentQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBackendAPI.mockReturnValue({
      axios: {
        delete: mockAxiosDelete,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      handleResponse: mockHandleResponse,
    } as ReturnType<typeof useBackendAPI>);
  });

  it('calls axios.delete with correct endpoint when removing attachment', async () => {
    mockHandleResponse.mockResolvedValue({
      applicationId: 'app-123',
      attachmentId: 'att-456',
    });

    const { result } = renderHook(() => useRemoveAttachmentQuery(), {
      wrapper: createWrapper(),
    });

    const attachmentData: RemoveAttachmentData = {
      applicationId: 'app-123',
      attachmentId: 'att-456',
    };

    await result.current.mutateAsync(attachmentData);

    await waitFor(() => {
      expect(mockAxiosDelete).toHaveBeenCalledWith(
        `${BackendEndpoint.APPLICATIONS}app-123/attachments/att-456/`
      );
    });
  });

  it('rejects with error when applicationId is missing', async () => {
    const { result } = renderHook(() => useRemoveAttachmentQuery(), {
      wrapper: createWrapper(),
    });

    const attachmentData: RemoveAttachmentData = {
      applicationId: '',
      attachmentId: 'att-456',
    };

    await expect(result.current.mutateAsync(attachmentData)).rejects.toThrow(
      'Missing application id'
    );

    expect(mockAxiosDelete).not.toHaveBeenCalled();
  });

  it('updates cache by removing attachment and invalidates applicationsList', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const mockApplicationData: ApplicationData = {
      id: 'app-123',
      applicationStep: 'step_1',
      employee: {
        firstName: 'John',
        lastName: 'Doe',
        socialSecurityNumber: '010101-1234',
        isLivingInHelsinki: true,
        jobTitle: 'Developer',
        monthlyPay: '3000',
        vacationMoney: '300',
        otherExpenses: '100',
        workingHours: '40',
        collectiveBargainingAgreement: 'TES',
        employeeLanguage: 'fi',
        commissionAmount: '',
        commissionDescription: '',
      },
      useAlternativeAddress: false,
      archived: false,
      bases: [],
      deMinimisAidSet: [],
      trainingCompensations: [],
      alterations: [],
      companyContactPersonFirstName: 'Jane',
      companyContactPersonLastName: 'Smith',
      talpaStatus: 'not_sent',
      ahjoStatus: 'submitted_but_not_sent_to_ahjo',
      ahjoCaseId: '',
      attachments: [
        {
          id: 'att-456',
          attachmentFileName: 'document1.pdf',
          attachmentFile: 'http://example.com/doc1.pdf',
          attachmentType: 'employment_contract',
          contentType: 'application/pdf',
        },
        {
          id: 'att-789',
          attachmentFileName: 'document2.pdf',
          attachmentFile: 'http://example.com/doc2.pdf',
          attachmentType: 'pay_subsidy_decision',
          contentType: 'application/pdf',
        },
      ],
    } as ApplicationData;

    queryClient.setQueryData(['applications', 'app-123'], mockApplicationData);

    mockHandleResponse.mockResolvedValue({
      applicationId: 'app-123',
      attachmentId: 'att-456',
    });

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    // eslint-disable-next-line react/display-name
    const wrapper = ({
      children,
    }: {
      children: React.ReactNode;
    }): JSX.Element => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRemoveAttachmentQuery(), {
      wrapper,
    });

    const attachmentData: RemoveAttachmentData = {
      applicationId: 'app-123',
      attachmentId: 'att-456',
    };

    await result.current.mutateAsync(attachmentData);

    const cachedData = queryClient.getQueryData<ApplicationData>([
      'applications',
      'app-123',
    ]);

    expect(cachedData?.attachments).toHaveLength(1);
    expect(cachedData?.attachments?.[0].id).toBe('att-789');

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith('applicationsList');
    });
  });
});
