import { renderHook } from '@testing-library/react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/application-form-data';

import useResetApplicationFormValuesEffect from '../useResetApplicationFormValuesEffect';

jest.mock('kesaseteli/employer/hooks/application/useApplicationApi');
jest.mock('kesaseteli/employer/services/ApplicationPersistenceService');

describe('useResetApplicationFormValuesEffect', () => {
  let mockReset: jest.Mock;
  let mockGetValues: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReset = jest.fn();
    mockGetValues = jest.fn();
  });

  const runHook = (isDirty: boolean): void => {
    const mockMethods = {
      reset: mockReset,
      getValues: mockGetValues,
      formState: { isDirty },
    } as unknown as UseFormReturn<Application>;
    renderHook(() => useResetApplicationFormValuesEffect(mockMethods));
  };

  it('does nothing if application query has not succeeded or is empty', () => {
    (useApplicationApi as jest.Mock).mockReturnValue({
      applicationQuery: {
        isSuccess: false,
        data: undefined,
      },
    });

    runHook(false);
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('resets form values on success when form is clean (isDirty = false)', () => {
    const mockServerData = {
      id: 'app-123',
      contact_person_name: 'John Doe',
      summer_vouchers: [
        {
          id: 'v-1',
          employee_name: 'Voucher Employee',
        },
      ],
    };
    (useApplicationApi as jest.Mock).mockReturnValue({
      applicationQuery: {
        isSuccess: true,
        data: mockServerData,
      },
    });

    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(null);

    runHook(false);

    expect(mockReset).toHaveBeenCalledTimes(1);
    const [resetValues, resetOptions] = mockReset.mock.calls[0];
    expect(resetValues.id).toBe('app-123');
    expect(resetValues.contact_person_name).toBe('John Doe');
    expect(resetValues.summer_vouchers[0].employee_name).toBe(
      'Voucher Employee'
    );
    expect(resetOptions).toEqual({ keepDirty: false });
  });

  it('merges employer prefill data if present and values are missing', () => {
    const mockServerData = {
      id: 'app-123',
      contact_person_name: '',
      street_address: 'Original Address',
      summer_vouchers: [],
    };
    (useApplicationApi as jest.Mock).mockReturnValue({
      applicationQuery: {
        isSuccess: true,
        data: mockServerData,
      },
    });

    const mockEmployerData = {
      contact_person_name: 'Employer Name',
      street_address: 'New Address',
    };
    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(mockEmployerData);

    runHook(false);

    expect(mockReset).toHaveBeenCalledTimes(1);
    const [resetValues] = mockReset.mock.calls[0];
    expect(resetValues.contact_person_name).toBe('Employer Name');
    expect(resetValues.street_address).toBe('Original Address');
  });

  it('ensures at least one empty voucher exists if server returns empty list', () => {
    const mockServerData = {
      id: 'app-123',
      summer_vouchers: [],
    };
    (useApplicationApi as jest.Mock).mockReturnValue({
      applicationQuery: {
        isSuccess: true,
        data: mockServerData,
      },
    });

    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(null);

    runHook(false);

    expect(mockReset).toHaveBeenCalledTimes(1);
    const [resetValues] = mockReset.mock.calls[0];
    expect(resetValues.summer_vouchers).toHaveLength(1);
    expect(resetValues.summer_vouchers[0].summer_voucher_serial_number).toBe(
      ''
    );
  });

  it('merges current user typed changes if form is dirty', () => {
    const mockServerData = {
      id: 'app-123',
      contact_person_name: 'Original John',
      summer_vouchers: [
        {
          id: 'v-1',
          employee_name: 'Original Employee',
          summer_voucher_serial_number: '123',
        },
      ],
    };
    (useApplicationApi as jest.Mock).mockReturnValue({
      applicationQuery: {
        isSuccess: true,
        data: mockServerData,
      },
    });

    const mockUserTypedValues = {
      contact_person_name: 'User Edited Name',
      street_address: 'User Typed Address',
      summer_vouchers: [
        {
          employee_name: 'User Edited Employee',
          summer_voucher_serial_number: null,
        },
      ],
    };
    mockGetValues.mockReturnValue(mockUserTypedValues);
    (
      ApplicationPersistenceService.getEmployerData as jest.Mock
    ).mockReturnValue(null);

    runHook(true);

    expect(mockReset).toHaveBeenCalledTimes(1);
    const [resetValues, resetOptions] = mockReset.mock.calls[0];
    expect(resetValues.contact_person_name).toBe('User Edited Name');
    expect(resetValues.street_address).toBe('User Typed Address');
    expect(resetValues.summer_vouchers[0].employee_name).toBe(
      'User Edited Employee'
    );
    expect(resetValues.summer_vouchers[0].summer_voucher_serial_number).toBe(
      '123'
    );
    expect(resetOptions).toEqual({ keepDirty: true });
  });
});
