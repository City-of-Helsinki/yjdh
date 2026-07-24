import { act, renderHook } from '@testing-library/react';
import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import { useApplicationFormContext } from 'benefit/handler/hooks/useApplicationFormContext';
import useApplicationQueryWithState from 'benefit/handler/hooks/useApplicationQueryWithState';
import useFormActions from 'benefit/handler/hooks/useFormActions';
import { useSteps } from 'benefit/handler/hooks/useSteps';
import useUserQuery from 'benefit/handler/hooks/useUserQuery';
import { APPLICATION_ORIGINS } from 'benefit-shared/constants';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { focusAndScroll } from 'shared/utils/dom.utils';

import { useApplicationForm } from '../useApplicationForm';
import {
  getApplication,
  getDates,
  getFields,
  getSubsidyOptions,
  handleErrorFieldKeys,
  requiredAttachments,
} from '../utils/applicationForm';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('formik', () => ({
  useFormik: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useApplicationFormContext', () => ({
  useApplicationFormContext: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useApplicationQueryWithState', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useFormActions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useSteps', () => ({
  useSteps: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useUserQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

jest.mock('../utils/validation', () => ({
  getValidationSchema: jest.fn(() => ({})),
}));

jest.mock('../utils/applicationForm', () => ({
  errorToast: jest.fn(),
  getApplication: jest.fn(),
  getDates: jest.fn(),
  getFields: jest.fn(),
  getSubsidyOptions: jest.fn(),
  handleErrorFieldKeys: jest.fn(),
  requiredAttachments: jest.fn(),
}));

const onSave = jest.fn();
const onQuietSave = jest.fn();
const onSubmit = jest.fn();
const onNext = jest.fn();
const onDelete = jest.fn();
const dispatchStep = jest.fn();
const validateForm = jest.fn();
const setTouched = jest.fn();
const submitForm = jest.fn();
const setFieldValue = jest.fn();

const application = {
  id: 'application-id',
  applicationOrigin: APPLICATION_ORIGINS.HANDLER,
  company: {
    organizationType: 'company',
  },
  attachments: [],
  applicantTermsInEffect: {
    applicantConsents: [],
  },
  deMinimisAidSet: [],
};

const formikMock = {
  values: {
    ...application,
    deMinimisAid: false,
  },
  validateForm,
  setTouched,
  submitForm,
  setFieldValue,
};

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <DeMinimisContext.Provider
    value={{
      deMinimisAids: [],
      setDeMinimisAids: jest.fn(),
      unfinishedDeMinimisAidRow: false,
    }}
  >
    {children}
  </DeMinimisContext.Provider>
);

describe('useApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: jest.fn(),
    });

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (useApplicationFormContext as jest.Mock).mockReturnValue({
      isFormActionNew: true,
      isFormActionEdit: false,
    });

    (useSteps as jest.Mock).mockReturnValue({
      stepState: {
        activeStepIndex: 1,
        steps: [],
      },
      dispatchStep,
      activeStep: 1,
    });

    (useFormActions as jest.Mock).mockReturnValue({
      onSave,
      onQuietSave,
      onSubmit,
      onNext,
      onDelete,
    });

    (useApplicationQueryWithState as jest.Mock).mockReturnValue({
      status: 'idle',
      data: undefined,
      error: undefined,
    });

    (useUserQuery as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
      },
    });

    (getApplication as jest.Mock).mockReturnValue(application);

    (getFields as jest.Mock).mockReturnValue({
      endDate: {
        name: APPLICATION_FIELD_KEYS.END_DATE,
      },
    });

    (getDates as jest.Mock).mockReturnValue({
      minEndDate: new Date('2024-01-01'),
      minEndDateFormatted: '1.1.2024',
      maxEndDate: undefined,
      isEndDateEligible: true,
    });

    (getSubsidyOptions as jest.Mock).mockReturnValue([]);

    (requiredAttachments as jest.Mock).mockReturnValue(true);

    (handleErrorFieldKeys as jest.Mock).mockImplementation(
      (fieldKey) => fieldKey
    );

    (useFormik as jest.Mock).mockReturnValue(formikMock);
  });

  it('marks invalid top-level and nested fields as touched when validation fails', async () => {
    validateForm.mockResolvedValue({
      [APPLICATION_FIELD_KEYS.PURCHASED_SERVICE]: 'required',
      employee: {
        firstName: 'required',
      },
    });

    const { result } = renderHook(() => useApplicationForm(), { wrapper });

    let isValid = true;

    await act(async () => {
      isValid = await result.current.handleValidation();
    });

    expect(isValid).toBe(false);
    expect(setTouched).toHaveBeenCalledWith(
      {
        [APPLICATION_FIELD_KEYS.PURCHASED_SERVICE]: true,
        employee: {
          firstName: true,
        },
      },
      true
    );
    expect(focusAndScroll).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.PURCHASED_SERVICE
    );
  });

  it('does not mark fields as touched when validation has no errors', async () => {
    validateForm.mockResolvedValue({});

    const { result } = renderHook(() => useApplicationForm(), { wrapper });

    let isValid = false;

    await act(async () => {
      isValid = await result.current.handleValidation();
    });

    expect(isValid).toBe(true);
    expect(setTouched).not.toHaveBeenCalled();
    expect(focusAndScroll).not.toHaveBeenCalled();
  });

  it('marks invalid fields as touched and does not submit when saving invalid form', async () => {
    validateForm.mockResolvedValue({
      [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS]: 'required',
    });

    const { result } = renderHook(() => useApplicationForm(), { wrapper });

    await act(() => result.current.handleSave() as unknown as Promise<void>);

    expect(setTouched).toHaveBeenCalledWith(
      {
        [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS]: true,
      },
      true
    );
    expect(focusAndScroll).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS
    );
    expect(submitForm).not.toHaveBeenCalled();
  });

  it('submits the form when saving valid form', async () => {
    validateForm.mockResolvedValue({});

    const { result } = renderHook(() => useApplicationForm(), { wrapper });

    await act(() => result.current.handleSave() as unknown as Promise<void>);

    expect(setTouched).not.toHaveBeenCalled();
    expect(focusAndScroll).not.toHaveBeenCalled();
    expect(submitForm).toHaveBeenCalledTimes(1);
  });
});
