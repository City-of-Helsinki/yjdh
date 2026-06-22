import { renderHook } from '@testing-library/react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import type Application from 'shared/types/application';

import useApplicationApi from '../useApplicationApi';

jest.mock('shared/components/toast/show-error-toast');

const mockMutate = jest.fn();
jest.mock('kesaseteli/employer/hooks/backend/useEmploymentQuery', () =>
  jest.fn(() => ({
    mutate: mockMutate,
  }))
);

jest.mock('kesaseteli/employer/hooks/backend/useApplicationQuery', () =>
  jest.fn()
);
jest.mock('kesaseteli/employer/hooks/backend/useDeleteApplicationQuery', () =>
  jest.fn()
);
const mockUpdateMutate = jest.fn();
const mockUpdateMutateAsync = jest.fn();
jest.mock('kesaseteli/employer/hooks/backend/useUpdateApplicationQuery', () =>
  jest.fn(() => ({
    mutate: mockUpdateMutate,
    mutateAsync: mockUpdateMutateAsync,
  }))
);

jest.mock('shared/hooks/useErrorHandler', () => jest.fn(() => jest.fn()));
jest.mock('shared/hooks/useRouterQueryParam', () =>
  jest.fn(() => ({
    value: 'test-id',
    isRouterLoading: false,
  }))
);

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

const createAxiosError = (
  status: number,
  errorCode?: string
): Error & {
  isAxiosError: boolean;
  response: {
    status: number;
    data: {
      error_code?: string;
    };
  };
} => {
  const error = new Error('Axios Error') as Error & {
    isAxiosError: boolean;
    response: {
      status: number;
      data: {
        error_code?: string;
      };
    };
  };
  error.isAxiosError = true;
  error.response = {
    status,
    data: {
      error_code: errorCode,
    },
  };
  return error;
};

describe('useApplicationApi - fetchEmployment', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      // eslint-disable-next-line unicorn/no-useless-undefined
      .mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('calls onSuccess callback with updated application data on successful fetch', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const mockOnSuccess = jest.fn();
    const draftApplication = {
      summer_vouchers: [{ id: 'voucher-1', employee_name: 'John' }],
    } as Application;

    await result.current.fetchEmployment(draftApplication, 0, mockOnSuccess);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [, options] = mockMutate.mock.calls[0];

    options.onSuccess({
      employer_summer_voucher_id: 'voucher-1',
      employee_name: 'John Doe',
      employee_birthdate: '2000-01-01',
    });

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledWith({
      summer_vouchers: [
        {
          id: 'voucher-1',
          employee_name: 'John Doe',
          employee_birthdate: '2000-01-01',
        },
      ],
    });
  });

  it('displays correct error toast when youth application is not accepted (400 - youth_application_not_accepted)', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const draftApplication = {
      summer_vouchers: [{ id: 'v-1' }],
    } as Application;

    await result.current.fetchEmployment(draftApplication, 0);
    const [, options] = mockMutate.mock.calls[0];

    options.onError(createAxiosError(400, 'youth_application_not_accepted'));

    expect(showErrorToast).toHaveBeenCalledWith(
      'common:application.step1.employment_section.fetch_employment_error_title',
      'common:application.step1.employment_section.fetch_employment_not_accepted_error_message'
    );
  });

  it('displays correct error toast when summer voucher is already used (400 - summer_voucher_already_used)', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const draftApplication = {
      summer_vouchers: [{ id: 'v-1' }],
    } as Application;

    await result.current.fetchEmployment(draftApplication, 0);
    const [, options] = mockMutate.mock.calls[0];

    options.onError(createAxiosError(400, 'summer_voucher_already_used'));

    expect(showErrorToast).toHaveBeenCalledWith(
      'common:application.step1.employment_section.fetch_employment_error_title',
      'common:application.step1.employment_section.fetch_employment_already_used_error_message'
    );
  });

  it('displays correct error toast when employee info is not found (404)', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const draftApplication = {
      summer_vouchers: [{ id: 'v-1' }],
    } as Application;

    await result.current.fetchEmployment(draftApplication, 0);
    const [, options] = mockMutate.mock.calls[0];

    options.onError(createAxiosError(404));

    expect(showErrorToast).toHaveBeenCalledWith(
      'common:application.step1.employment_section.fetch_employment_error_title',
      'common:application.step1.employment_section.fetch_employment_not_found_error_message'
    );
  });

  it('displays generic error toast for other Axios errors or general errors', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const draftApplication = {
      summer_vouchers: [{ id: 'v-1' }],
    } as Application;

    await result.current.fetchEmployment(draftApplication, 0);
    const [, options] = mockMutate.mock.calls[0];

    // Generic Axios error
    options.onError(createAxiosError(500));

    expect(showErrorToast).toHaveBeenCalledWith(
      'common:application.step1.employment_section.fetch_employment_error_title',
      'common:application.step1.employment_section.fetch_employment_error_message'
    );

    jest.clearAllMocks();

    // Plain non-Axios error
    options.onError(new Error('Generic failure'));

    expect(showErrorToast).toHaveBeenCalledWith(
      'common:application.step1.employment_section.fetch_employment_error_title',
      'common:application.step1.employment_section.fetch_employment_error_message'
    );
  });

  it('saves draft application first if voucher ID is missing, then fetches employment', async () => {
    const { result } = renderHook(() => useApplicationApi());
    const mockOnSuccess = jest.fn();
    const draftApplication = {
      summer_vouchers: [
        { employee_name: 'John', summer_voucher_serial_number: '123' },
      ],
    } as Application;

    mockUpdateMutateAsync.mockResolvedValueOnce({
      ...draftApplication,
      summer_vouchers: [
        {
          id: 'voucher-generated-id',
          employee_name: 'John',
          summer_voucher_serial_number: '123',
        },
      ],
    });

    await result.current.fetchEmployment(draftApplication, 0, mockOnSuccess);

    expect(mockUpdateMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      ...draftApplication,
      status: 'draft',
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      {
        employee_name: 'John',
        summer_voucher_serial_number: '123',
        employer_summer_voucher_id: 'voucher-generated-id',
      },
      expect.anything()
    );
  });
});
