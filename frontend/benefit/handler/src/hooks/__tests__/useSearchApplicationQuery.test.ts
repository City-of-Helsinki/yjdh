import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import {
  DECISION_RANGE,
  SUBSIDY_IN_EFFECT,
} from '../../components/applicationsArchive/useApplicationsArchive';
import useSearchApplicationQuery from '../useSearchApplicationQuery';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockUseBackendAPI = useBackendAPI as jest.MockedFunction<
  typeof useBackendAPI
>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockShowErrorToast = showErrorToast as jest.MockedFunction<
  typeof showErrorToast
>;

describe('useSearchApplicationQuery', () => {
  const axios = {
    get: jest.fn(),
  };
  const handleResponse = jest.fn();
  const t = jest.fn((key: string) => key);

  let mutationFn: (payload: string | { q: string; limit?: number; offset?: number }) => Promise<unknown>;
  let mutationOptions: {
    onError?: () => void;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBackendAPI.mockReturnValue({
      axios: axios as never,
      handleResponse,
    } as never);

    mockUseTranslation.mockReturnValue({ t } as never);

    mockUseMutation.mockImplementation((fn, options) => {
      mutationFn = fn as typeof mutationFn;
      mutationOptions = options as typeof mutationOptions;

      return {
        mutate: jest.fn(),
      } as never;
    });
  });

  it('registers search mutation', () => {
    renderHook(() => useSearchApplicationQuery());

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        onError: expect.any(Function),
      })
    );
  });

  it('searches with only query parameter when payload is a string', async () => {
    const response = {
      data: {
        q: 'company',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
      },
    };

    axios.get.mockReturnValue(response);
    handleResponse.mockResolvedValue(response.data);

    renderHook(() => useSearchApplicationQuery());

    const result = await mutationFn('company');

    expect(axios.get).toHaveBeenCalledWith(BackendEndpoint.SEARCH, {
      params: {
        q: 'company',
      },
    });
    expect(handleResponse).toHaveBeenCalledWith(response);
    expect(result).toEqual(response.data);
  });

  it('includes pagination params when payload is an object', async () => {
    const response = {
      data: {
        q: 'company',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
        limit: 30,
        offset: 60,
      },
    };

    axios.get.mockReturnValue(response);
    handleResponse.mockResolvedValue(response.data);

    renderHook(() => useSearchApplicationQuery());

    await mutationFn({
      q: 'company',
      limit: 30,
      offset: 60,
    });

    expect(axios.get).toHaveBeenCalledWith(BackendEndpoint.SEARCH, {
      params: {
        q: 'company',
        limit: 30,
        offset: 60,
      },
    });
  });

  it('includes archive filters when they are enabled', async () => {
    const response = {
      data: {
        q: '',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
      },
    };

    axios.get.mockReturnValue(response);
    handleResponse.mockResolvedValue(response.data);

    renderHook(() =>
      useSearchApplicationQuery(
        true,
        true,
        SUBSIDY_IN_EFFECT.RANGE_NOW,
        DECISION_RANGE.RANGE_THREE_YEARS,
        '2026-0001',
        true
      )
    );

    await mutationFn({
      q: '',
      limit: 30,
      offset: 0,
    });

    expect(axios.get).toHaveBeenCalledWith(BackendEndpoint.SEARCH, {
      params: {
        q: '',
        archived: '1',
        archival: '1',
        subsidy_in_effect: SUBSIDY_IN_EFFECT.RANGE_NOW,
        years_since_decision: DECISION_RANGE.RANGE_THREE_YEARS,
        app_no: '2026-0001',
        load_all: '1',
        limit: 30,
        offset: 0,
      },
    });
  });

  it('does not include optional filters when they are not provided', async () => {
    const response = {
      data: {
        q: '',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
      },
    };

    axios.get.mockReturnValue(response);
    handleResponse.mockResolvedValue(response.data);

    renderHook(() =>
      useSearchApplicationQuery(false, false, undefined, undefined, undefined, false)
    );

    await mutationFn({
      q: '',
      limit: 30,
      offset: 0,
    });

    expect(axios.get).toHaveBeenCalledWith(BackendEndpoint.SEARCH, {
      params: {
        q: '',
        limit: 30,
        offset: 0,
      },
    });
  });

  it('keeps zero pagination values in params', async () => {
    const response = {
      data: {
        q: '',
        matches: [],
        filter: '',
        search_mode: '',
        count: 0,
        limit: 0,
        offset: 0,
      },
    };

    axios.get.mockReturnValue(response);
    handleResponse.mockResolvedValue(response.data);

    renderHook(() => useSearchApplicationQuery());

    await mutationFn({
      q: '',
      limit: 0,
      offset: 0,
    });

    expect(axios.get).toHaveBeenCalledWith(BackendEndpoint.SEARCH, {
      params: {
        q: '',
        limit: 0,
        offset: 0,
      },
    });
  });

  it('shows translated error toast on mutation error', () => {
    renderHook(() => useSearchApplicationQuery());

    mutationOptions.onError?.();

    expect(t).toHaveBeenCalledWith('common:applications.list.errors.fetch.label');
    expect(t).toHaveBeenCalledWith(
      'common:applications.list.errors.fetch.text',
      {
        status: 'error',
      }
    );
    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'common:applications.list.errors.fetch.label',
      'common:applications.list.errors.fetch.text'
    );
  });
});
