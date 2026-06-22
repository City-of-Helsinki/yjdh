import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { renderHook } from '@testing-library/react';
import { useQuery } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useAhjoSettingsQuery from '../useAhjoSettingsQuery';

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseBackendAPI = useBackendAPI as jest.MockedFunction<
  typeof useBackendAPI
>;

describe('useAhjoSettingsQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();

  let queryFn: jest.Mock;

  const setupQueryFn = (): void => {
    mockUseQuery.mockImplementation((_key, fn) => {
      queryFn = fn as jest.Mock;
      return { isLoading: false } as never;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryFn = jest.fn();

    mockUseBackendAPI.mockReturnValue({
      axios: axios as never,
      handleResponse,
    } as never);

    setupQueryFn();
  });

  it.each([['ahjo_decision_maker'], ['ahjo_signer']] as const)(
    'creates query with correct key for type %s',
    (type) => {
      renderHook(() => useAhjoSettingsQuery(type));

      expect(mockUseQuery).toHaveBeenCalledWith(
        ['ahjoSettings', type],
        expect.any(Function)
      );
    }
  );

  it.each<readonly ['ahjo_decision_maker' | 'ahjo_signer']>([
    ['ahjo_decision_maker'],
    ['ahjo_signer'],
  ])('makes request to correct endpoint for type %s', async (type) => {
    axios.get.mockResolvedValue({ data: null });
    handleResponse.mockResolvedValue({ data: [] });

    renderHook(() => useAhjoSettingsQuery(type));

    await queryFn();

    expect(axios.get).toHaveBeenCalledWith(`v1/ahjosettings/${type}`);
  });

  it.each<
    readonly [
      string,
      'ahjo_decision_maker' | 'ahjo_signer',
      Record<string, unknown>[],
      Record<string, unknown>[]
    ]
  >([
    [
      'single decision maker with optional field',
      'ahjo_decision_maker',
      [
        {
          id: '1',
          name: 'John Doe',
          employee_number: '12345',
        },
      ],
      [
        {
          id: '1',
          name: 'John Doe',
          employeeNumber: '12345',
        },
      ],
    ],
    [
      'single signer',
      'ahjo_signer',
      [
        {
          id: '1',
          name: 'Jane Smith',
        },
      ],
      [
        {
          id: '1',
          name: 'Jane Smith',
        },
      ],
    ],
    [
      'multiple items with nested fields',
      'ahjo_signer',
      [
        {
          id: '1',
          name: 'Item 1',
          nested_field: {
            deep_value: 'test',
          },
        },
        {
          id: '2',
          name: 'Item 2',
          nested_field: {
            deep_value: 'test2',
          },
        },
      ],
      [
        {
          id: '1',
          name: 'Item 1',
          nestedField: {
            deepValue: 'test',
          },
        },
        {
          id: '2',
          name: 'Item 2',
          nestedField: {
            deepValue: 'test2',
          },
        },
      ],
    ],
  ])(
    'transforms %s with camelcaseKeys',
    async (_description, type, inputData, expectedResult) => {
      handleResponse.mockResolvedValue({ data: inputData });

      renderHook(() => useAhjoSettingsQuery(type));

      const result = await queryFn();

      expect(result).toEqual(expectedResult);
    }
  );
  it.each<readonly [string, unknown]>([
    ['empty array', { data: [] }],
    ['null data', { data: null }],
    ['undefined data', { data: undefined }],
    ['null response', null],
  ])('handles %s', async (_description, response) => {
    handleResponse.mockResolvedValue(response);

    renderHook(() => useAhjoSettingsQuery('ahjo_decision_maker'));

    const result = await queryFn();

    expect(result).toEqual([]);
  });
});
