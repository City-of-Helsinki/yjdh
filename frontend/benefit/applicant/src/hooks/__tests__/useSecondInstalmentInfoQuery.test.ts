import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useSecondInstalmentInfoQuery from '../useSecondInstalmentInfoQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useSecondInstalmentInfoQuery', () => {
  const mockGet = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        get: mockGet,
      },
      handleResponse: mockHandleResponse,
    });
    (useQuery as jest.Mock).mockReturnValue({});
  });

  it('uses application id in query key and enables query when id exists', async () => {
    mockGet.mockResolvedValue({ data: {} });

    renderHook(() => useSecondInstalmentInfoQuery('app-1'));

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(queryConfig.queryKey).toEqual(['secondInstalmentInfo', 'app-1']);
    expect(queryConfig.enabled).toBe(true);
    expect(mockGet).toHaveBeenCalledWith(
      ApplicantEndpoint.SECOND_INSTALMENT_INFO('app-1')
    );
  });

  it('disables query when application id is missing', () => {
    renderHook(() => useSecondInstalmentInfoQuery());

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];

    expect(queryConfig.enabled).toBe(false);
  });
});
