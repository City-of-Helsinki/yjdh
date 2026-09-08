import { act, renderHook, waitFor } from '@testing-library/react';
import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { Application } from 'benefit/handler/types/application';
import {
  APPLICATION_ORIGINS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import * as React from 'react';
import { focusAndScroll } from 'shared/utils/dom.utils';
import * as Yup from 'yup';

import { useApplicationForm } from '../useApplicationForm';
import {
  errorToast,
  getApplication,
  getDates,
  getFields,
  handleErrorFieldKeys,
  requiredAttachments,
} from '../utils/applicationForm';
import { getValidationSchema } from '../utils/validation';

const mockOnSave = jest.fn();
const mockOnQuietSave = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnNext = jest.fn();
const mockOnDelete = jest.fn();

let mockIsFormActionNew = true;
let mockIsFormActionEdit = false;
let mockApplicationDataStatus: 'pending' | 'success' | 'error' = 'success';
let mockApplicationData: unknown;
let mockApplicationDataError: unknown = null;
let mockUser: unknown = { id: 'user-1' };

const baseApplication = (): Application =>
  ({
    id: undefined,
    status: 'draft',
    startDate: undefined,
    endDate: undefined,
    applicationOrigin: APPLICATION_ORIGINS.HANDLER,
    company: { organizationType: 'company' },
    employee: {},
    attachments: [],
    deMinimisAidSet: [],
    associationHasBusinessActivities: false,
    applicantTermsInEffect: null,
  } as unknown as Application);

let mockGetApplicationResult: Application = baseApplication();
let mockGetDatesResult = {
  minEndDate: new Date('2024-01-01'),
  minEndDateFormatted: '01.01.2024',
  maxEndDate: new Date('2025-01-01') as Date | undefined,
  isEndDateEligible: true as boolean | undefined,
};
let mockRequiredAttachmentsResult = true;
let mockValidationSchema: unknown;

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

jest.mock('../utils/applicationForm', () => ({
  errorToast: jest.fn(),
  getApplication: jest.fn(),
  getDates: jest.fn(),
  getFields: jest.fn(),
  getSubsidyOptions: jest.fn(() => [{ label: '50%', value: 50 }]),
  handleErrorFieldKeys: jest.fn((key: unknown) => key),
  requiredAttachments: jest.fn(),
}));

jest.mock('../utils/validation', () => ({
  getValidationSchema: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useApplicationFormContext', () => ({
  useApplicationFormContext: () => ({
    isFormActionNew: mockIsFormActionNew,
    isFormActionEdit: mockIsFormActionEdit,
  }),
}));

jest.mock('benefit/handler/hooks/useApplicationQueryWithState', () => ({
  __esModule: true,
  default: () => ({
    status: mockApplicationDataStatus,
    data: mockApplicationData,
    error: mockApplicationDataError,
  }),
}));

jest.mock('benefit/handler/hooks/useUserQuery', () => ({
  __esModule: true,
  default: () => ({ data: mockUser }),
}));

jest.mock('benefit/handler/hooks/useFormActions', () => ({
  __esModule: true,
  default: () => ({
    onSave: mockOnSave,
    onQuietSave: mockOnQuietSave,
    onSubmit: mockOnSubmit,
    onNext: mockOnNext,
    onDelete: mockOnDelete,
  }),
}));

const createWrapper =
  (deMinimisAids: DeMinimisAid[] = [], unfinishedDeMinimisAidRow = false) =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <DeMinimisContext.Provider
        value={{
          deMinimisAids,
          setDeMinimisAids: () => {},
          unfinishedDeMinimisAidRow,
          setUnfinishedDeMinimisAidRow: () => {},
        }}
      >
        {children}
      </DeMinimisContext.Provider>
    );

describe('useApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockIsFormActionNew = true;
    mockIsFormActionEdit = false;
    mockApplicationDataStatus = 'success';
    mockApplicationData = undefined;
    mockApplicationDataError = null;
    mockUser = { id: 'user-1' };
    mockRequiredAttachmentsResult = true;
    mockValidationSchema = undefined;
    mockGetApplicationResult = baseApplication();
    mockGetDatesResult = {
      minEndDate: new Date('2024-01-01'),
      minEndDateFormatted: '01.01.2024',
      maxEndDate: new Date('2025-01-01'),
      isEndDateEligible: true,
    };

    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      route: '',
    });

    (getApplication as jest.Mock).mockImplementation(
      () => mockGetApplicationResult
    );
    (getDates as jest.Mock).mockImplementation(() => mockGetDatesResult);
    (getFields as jest.Mock).mockReturnValue({
      endDate: { name: 'endDate' },
    });
    (requiredAttachments as jest.Mock).mockImplementation(
      () => mockRequiredAttachmentsResult
    );
    (getValidationSchema as jest.Mock).mockImplementation(
      () => mockValidationSchema
    );

    mockOnSave.mockResolvedValue(null);
    mockOnQuietSave.mockResolvedValue(null);
    mockOnSubmit.mockResolvedValue(null);
    mockOnDelete.mockReturnValue(null);
  });

  it('should expose all expected api methods and defaults for a new application', () => {
    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.id).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.application).toEqual(mockGetApplicationResult);
    expect(result.current.subsidyOptions).toEqual([
      { label: '50%', value: 50 },
    ]);
    expect(result.current.handleSave).toBeInstanceOf(Function);
    expect(result.current.handleValidation).toBeInstanceOf(Function);
    expect(result.current.getSelectValue).toBeInstanceOf(Function);
  });

  it('should leave paperApplicationDate undefined for applicant-origin applications', () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      applicationOrigin: APPLICATION_ORIGINS.APPLICANT,
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.formik.values.paperApplicationDate).toBeUndefined();
  });

  it('should read id from router query and set isLoading true while query is pending', () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '123' },
      route: '',
    });
    mockApplicationDataStatus = 'pending';

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.id).toBe('123');
    expect(result.current.isLoading).toBe(true);
  });

  it('should set isLoading false and initialApplication once data resolves', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '123' },
      route: '',
    });
    mockApplicationDataStatus = 'pending';
    mockApplicationData = undefined;

    const { result, rerender } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    mockApplicationDataStatus = 'success';
    mockApplicationData = { id: '123' };

    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.initialApplication).not.toBeNull();
  });

  it('should call errorToast when application data query errors out', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '123' },
      route: '',
    });
    mockApplicationDataError = new Error('failed to fetch');

    renderHook(() => useApplicationForm(), { wrapper: createWrapper() });

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
  });

  it('should call onNext through formik submit when validation passes', async () => {
    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper([{ id: 'aid-1' }], false),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should block submit and show error toast when de minimis form is unfinished', async () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      deMinimisAid: true,
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper([], true),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(errorToast).toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should focus invalid field and skip submit when formik validation fails', async () => {
    mockValidationSchema = Yup.object().shape({
      startDate: Yup.string().required(),
    });

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(handleErrorFieldKeys).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.START_DATE,
      expect.anything()
    );
    expect(focusAndScroll).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.START_DATE
    );
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should show required attachments error and skip submit when attachments missing', async () => {
    mockRequiredAttachmentsResult = false;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(errorToast).toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should show consent error and skip submit when a consent checkbox is unchecked', async () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      applicantTermsInEffect: {
        id: 'terms-1',
        applicantConsents: [{ id: 'consent-1' }],
      },
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(errorToast).toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(result.current.getConsentErrorText(0)).not.toBe('');
  });

  it('should not raise consent errors in edit mode', async () => {
    mockIsFormActionEdit = true;
    mockGetApplicationResult = {
      ...baseApplication(),
      applicantTermsInEffect: {
        id: 'terms-1',
        applicantConsents: [{ id: 'consent-1' }],
      },
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSave();
    });

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should resolve handleValidation to true when there are no errors', async () => {
    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper([{ id: 'aid-1' }], false),
    });

    let isValid: boolean | undefined;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      isValid = // eslint-disable-next-line @typescript-eslint/await-thenable
 await result.current.handleValidation();
    });

    expect(isValid).toBe(true);
  });

  it('should resolve handleValidation to false on validation error', async () => {
    mockValidationSchema = Yup.object().shape({
      startDate: Yup.string().required(),
    });

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    let isValid: boolean | undefined;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      isValid = // eslint-disable-next-line @typescript-eslint/await-thenable
 await result.current.handleValidation();
    });

    expect(isValid).toBe(false);
  });

  it('should delegate handleQuietSave, handleSaveDraft, handleDelete and handleSubmit to the matching form actions', async () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      id: 'app-1',
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleQuietSave();
    });
    expect(mockOnQuietSave).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSaveDraft();
    });
    expect(mockOnSave).toHaveBeenCalled();

    act(() => {
      result.current.handleDelete();
    });
    expect(mockOnDelete).toHaveBeenCalledWith('app-1');

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await result.current.handleSubmit();
    });
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should return a matching subsidy option or null for getSelectValue', () => {
    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(
      result.current.getSelectValue('paySubsidyPercent' as keyof Application)
    ).toBeNull();
  });

  it('should toggle checkedConsentArray and mirror error state on handleConsentClick', () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      applicantTermsInEffect: {
        id: 'terms-1',
        applicantConsents: [{ id: 'consent-1' }, { id: 'consent-2' }],
      },
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.checkedConsentArray).toEqual([false, false]);

    act(() => {
      result.current.handleConsentClick(0);
    });

    expect(result.current.checkedConsentArray).toEqual([true, false]);
    expect(result.current.getConsentErrorText(0)).toBe('');
  });

  it('should compute showDeminimisSection based on organization type and business activities', () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      company: { organizationType: ORGANIZATION_TYPES.ASSOCIATION },
      associationHasBusinessActivities: false,
    } as unknown as Application;

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.showDeminimisSection).toBe(false);
  });

  it('should clear endDate when startDate is removed but endDate remains', () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      startDate: undefined,
      endDate: '31.12.2024',
    } as unknown as Application;
    mockGetDatesResult = {
      ...mockGetDatesResult,
      isEndDateEligible: false,
    };

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setEndDate();
    });

    expect(result.current.formik.values.endDate).toBe('');
  });

  it('should reset endDate to minEndDateFormatted when startDate set and end date not eligible', () => {
    mockGetApplicationResult = {
      ...baseApplication(),
      startDate: '01.01.2024',
      endDate: '01.01.2020',
    } as unknown as Application;
    mockGetDatesResult = {
      ...mockGetDatesResult,
      isEndDateEligible: false,
      minEndDateFormatted: '01.06.2024',
    };

    const { result } = renderHook(() => useApplicationForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setEndDate();
    });

    expect(result.current.formik.values.endDate).toBe('01.06.2024');
  });
});
