import { act, renderHook } from '@testing-library/react-hooks';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';

import { useApplicationFormStep6 } from '../useApplicationFormStep6';

jest.mock('benefit/applicant/hooks/useUpdateApplicationQuery', () =>
  jest.fn(() => ({ mutate: jest.fn(), error: null }))
);

jest.mock('benefit/applicant/hooks/useFormActions', () =>
  jest.fn(() => ({
    onBack: jest.fn(),
    onSave: jest.fn(),
    onDelete: jest.fn(),
  }))
);

jest.mock('benefit/applicant/hooks/useLocale', () => jest.fn(() => 'fi'));

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), locale: 'fi', asPath: '/' }),
}));

const baseApplication = {
  id: 'test-id',
  status: APPLICATION_STATUSES.DRAFT,
  applicantTermsInEffect: null,
} as unknown as Application;

describe('useApplicationFormStep6', () => {
  it('calls setIsResubmission(false) on handleSubmit when application is a draft', () => {
    const setIsSubmittedApplication = jest.fn();
    const setIsResubmission = jest.fn();

    const { result } = renderHook(() =>
      useApplicationFormStep6(
        baseApplication,
        setIsSubmittedApplication,
        setIsResubmission
      )
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(setIsResubmission).toHaveBeenCalledWith(false);
  });

  it('calls setIsResubmission(true) on handleSubmit when application is not a draft', () => {
    const setIsSubmittedApplication = jest.fn();
    const setIsResubmission = jest.fn();
    const receivedApplication = {
      ...baseApplication,
      status: APPLICATION_STATUSES.RECEIVED,
    } as unknown as Application;

    const { result } = renderHook(() =>
      useApplicationFormStep6(
        receivedApplication,
        setIsSubmittedApplication,
        setIsResubmission
      )
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(setIsResubmission).toHaveBeenCalledWith(true);
  });

  it('does not call setIsResubmission when it is not provided', () => {
    const setIsSubmittedApplication = jest.fn();

    const { result } = renderHook(() =>
      useApplicationFormStep6(baseApplication, setIsSubmittedApplication)
    );

    expect(() => {
      act(() => {
        result.current.handleSubmit();
      });
    }).not.toThrow();
  });
});
