import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import useApplicationsQuery from '../useApplicationsQuery';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({ isError: false })),
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useBackendAPI', () => () => ({
  axios: {
    get: jest.fn(),
  },
  handleResponse: jest.fn(),
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useErrorHandler', () => () => jest.fn());

describe('useApplicationsQuery placeholderData behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially keeps previous data', () => {
    renderHook(() =>
      useApplicationsQuery({
        onlyMine: false,
        year: '2023',
      })
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      })
    );
  });

  it('drops previous data when filter changes', () => {
    const onlyMine = false;
    let year = '2023';

    const { rerender } = renderHook(() =>
      useApplicationsQuery({
        onlyMine,
        year,
      })
    );

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      })
    );

    // Change year filter
    year = '2024';
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        placeholderData: undefined,
      })
    );

    // Render again with same filters (simulate fetch in progress or completion)
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      })
    );
  });

  it('keeps previous data when only pagination changes', () => {
    let offset = 0;
    const { rerender } = renderHook(() =>
      useApplicationsQuery({
        onlyMine: false,
        year: '2023',
        limit: 15,
        offset,
      })
    );

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      })
    );

    // Change offset (pagination)
    offset = 15;
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        placeholderData: keepPreviousData,
      })
    );
  });
});
