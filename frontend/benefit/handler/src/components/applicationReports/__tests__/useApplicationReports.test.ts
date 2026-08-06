import { renderHook } from '@testing-library/react';
import {
  EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS,
  EXPORT_APPLICATIONS_ROUTES,
} from 'benefit/handler/constants';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { PROPOSALS_FOR_DECISION } from 'benefit-shared/constants';
import { useQueryClient } from 'react-query';

import { useApplicationReports } from '../useApplicationReports';

const mockAxiosGet = jest.fn();
const mockHandleResponse = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockDownloadFile = jest.fn();
const mockUseReportsApplicationBatchesQuery = jest.fn();
const mockConvertToBackendDateFormat = jest.fn();
const mockConvertToUIDateFormat = jest.fn();

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock('styled-components', () => ({
  useTheme: () => ({
    colors: { primary: '#000' },
  }),
}));
jest.mock('shared/hooks/useLocale', () => ({
  __esModule: true,
  default: () => 'fi',
}));
jest.mock('benefit/handler/hooks/useReportsApplicationBatchesQuery', () => ({
  __esModule: true,
  default: (proposalForDecision: PROPOSALS_FOR_DECISION) =>
    mockUseReportsApplicationBatchesQuery(proposalForDecision),
  getReportsApplicationBatchesQueryKey: (proposal: string) => [
    `reports-${proposal}`,
  ],
}));
jest.mock('shared/hooks/useBackendAPI', () => ({
  __esModule: true,
  default: () => ({
    axios: {
      get: mockAxiosGet,
    },
    handleResponse: mockHandleResponse,
  }),
}));
jest.mock('react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
}));
jest.mock('shared/utils/file.utils', () => ({
  downloadFile: (...args: unknown[]) => mockDownloadFile(...args),
}));
jest.mock('shared/utils/date.utils', () => ({
  convertToBackendDateFormat: (value: string) =>
    mockConvertToBackendDateFormat(value),
  convertToUIDateFormat: (value: string) => mockConvertToUIDateFormat(value),
}));

describe('useApplicationReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosGet.mockResolvedValue('mock-file-content');
    mockHandleResponse.mockImplementation(async (value: Promise<string>) =>
      value instanceof Promise ? value : Promise.resolve(value)
    );
    mockUseReportsApplicationBatchesQuery.mockImplementation(() => ({
      data: [],
    }));
    mockConvertToBackendDateFormat.mockImplementation(
      (value: string) => `backend:${value}`
    );
    mockConvertToUIDateFormat.mockImplementation(
      (value: string) => `ui:${value}`
    );
  });

  it('should return object with all expected properties', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(result.current).toBeDefined();
    expect(result.current.t).toBeDefined();
    expect(result.current.translationsBase).toBe('common:reports');
    expect(result.current.theme).toBeDefined();
    expect(result.current.language).toBe('fi');
    expect(result.current.exportApplications).toBeDefined();
    expect(result.current.formik).toBeDefined();
    expect(result.current.fields).toBeDefined();
    expect(result.current.exportApplicationsInTimeRange).toBeDefined();
    expect(result.current.lastAcceptedApplicationsExportDate).toBeDefined();
    expect(result.current.lastRejectedApplicationsExportDate).toBeDefined();
  });

  it('should initialize formik with empty date fields', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(result.current.formik.values.startDate).toBe('');
    expect(result.current.formik.values.endDate).toBe('');
  });

  it('should create fields for all form keys', () => {
    const { result } = renderHook(() => useApplicationReports());

    Object.values(EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS).forEach(
      (fieldName) => {
        expect(result.current.fields[fieldName]).toBeDefined();
        expect(result.current.fields[fieldName].name).toBe(fieldName);
        expect(result.current.fields[fieldName].label).toBeDefined();
        expect(result.current.fields[fieldName].placeholder).toBeDefined();
      }
    );
  });

  it('should have exportApplications as function', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(typeof result.current.exportApplications).toBe('function');
  });

  it('should have exportApplicationsInTimeRange as function', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(typeof result.current.exportApplicationsInTimeRange).toBe(
      'function'
    );
  });

  it('should return empty export dates when batch data is empty', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(result.current.lastAcceptedApplicationsExportDate).toBe('');
    expect(result.current.lastRejectedApplicationsExportDate).toBe('');
  });

  it('should return converted latest accepted and rejected export dates', () => {
    mockUseReportsApplicationBatchesQuery.mockImplementation(
      (proposalForDecision: PROPOSALS_FOR_DECISION) => ({
        data:
          proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
            ? [{ created_at: '2024-01-01' }, { created_at: '2024-03-15' }]
            : [{ created_at: '2024-02-20' }],
      })
    );

    const { result } = renderHook(() => useApplicationReports());

    expect(mockConvertToUIDateFormat).toHaveBeenCalledWith('2024-03-15');
    expect(mockConvertToUIDateFormat).toHaveBeenCalledWith('2024-02-20');
    expect(result.current.lastAcceptedApplicationsExportDate).toBe(
      'ui:2024-03-15'
    );
    expect(result.current.lastRejectedApplicationsExportDate).toBe(
      'ui:2024-02-20'
    );
  });

  it('should export applications and invalidate matching batch query', async () => {
    const { result } = renderHook(() => useApplicationReports());

    await result.current.exportApplications(
      'csv/pdf',
      EXPORT_APPLICATIONS_ROUTES.ACCEPTED,
      PROPOSALS_FOR_DECISION.ACCEPTED
    );

    expect(mockAxiosGet).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}${EXPORT_APPLICATIONS_ROUTES.ACCEPTED}_csv_pdf/`,
      { responseType: 'arraybuffer' }
    );
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mock-file-content',
      'csv/pdf'
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith([
      `reports-${PROPOSALS_FOR_DECISION.ACCEPTED}`,
    ]);
  });

  it('should export applications in time range with converted date params', async () => {
    const { result, rerender } = renderHook(() => useApplicationReports());

    await result.current.formik.setValues({
      startDate: '01.03.2024',
      endDate: '31.03.2024',
    });

    rerender();

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await result.current.exportApplicationsInTimeRange('csv', true);

    expect(mockConvertToBackendDateFormat).toHaveBeenCalledWith('01.03.2024');
    expect(mockConvertToBackendDateFormat).toHaveBeenCalledWith('31.03.2024');
    expect(mockAxiosGet).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}${EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE}/`,
      {
        params: {
          handled_at_after: 'backend:01.03.2024',
          handled_at_before: 'backend:31.03.2024',
          compact_list: true,
        },
      }
    );
    expect(mockDownloadFile).toHaveBeenCalledWith('mock-file-content', 'csv');
  });

  it('should have correct export applications routes available', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(result.current).toBeDefined();
    // Routes are constants and should match expected values
    expect(EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE).toBeDefined();
  });

  it('should have proposal for decision constants available', () => {
    const { result } = renderHook(() => useApplicationReports());

    expect(result.current).toBeDefined();
    // Constants should be available
    expect(PROPOSALS_FOR_DECISION.ACCEPTED).toBeDefined();
    expect(PROPOSALS_FOR_DECISION.REJECTED).toBeDefined();
  });

  it('should call useQueryClient hook', () => {
    renderHook(() => useApplicationReports());

    expect(useQueryClient).toHaveBeenCalled();
  });
});
