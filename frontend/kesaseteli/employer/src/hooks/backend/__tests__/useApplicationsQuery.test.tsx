import { renderHook } from '@testing-library/react-hooks';
import { useQuery } from 'react-query';

import useApplicationsQuery from '../useApplicationsQuery';

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
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

describe('useApplicationsQuery keepPreviousData behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially sets keepPreviousData to true', () => {
    renderHook(() =>
      useApplicationsQuery({
        onlyMine: false,
        year: '2023',
      })
    );

    expect(useQuery).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: true,
      })
    );
  });

  it('sets keepPreviousData to false when filter changes', () => {
    const onlyMine = false;
    let year = '2023';

    const { rerender } = renderHook(() =>
      useApplicationsQuery({
        onlyMine,
        year,
      })
    );

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: true,
      })
    );

    // Change year filter
    year = '2024';
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: false,
      })
    );

    // Render again with same filters (simulate fetch in progress or completion)
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: true,
      })
    );
  });

  it('keeps keepPreviousData as true when only pagination changes', () => {
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
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: true,
      })
    );

    // Change offset (pagination)
    offset = 15;
    rerender();

    expect(useQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        keepPreviousData: true,
      })
    );
  });
});
