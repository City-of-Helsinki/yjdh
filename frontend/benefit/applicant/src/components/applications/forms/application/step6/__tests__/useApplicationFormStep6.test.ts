import { act, renderHook } from '@testing-library/react-hooks';
import useLocale from 'benefit/applicant/hooks/useLocale';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
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

const mockUseLocale = useLocale as jest.Mock;

const baseApplication = {
  id: 'test-id',
  status: APPLICATION_STATUSES.DRAFT,
  applicantTermsInEffect: null,
} as unknown as Application;

const applicationWithTerms = {
  ...baseApplication,
  applicantTermsInEffect: {
    id: 'terms-id',
    effectiveFrom: '2026-01-01',
    termsType: ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
    applicantConsents: [],
    termsMdFi: '# Finnish terms',
    termsMdSv: '# Swedish terms',
    termsMdEn: '# English terms',
    termsPdfFi: 'https://example.com/terms-fi.pdf',
    termsPdfSv: 'https://example.com/terms-sv.pdf',
    termsPdfEn: 'https://example.com/terms-en.pdf',
    termsPdf2Fi: 'https://example.com/terms-2-fi.pdf',
    termsPdf2Sv: 'https://example.com/terms-2-sv.pdf',
    termsPdf2En: 'https://example.com/terms-2-en.pdf',
    termsPdf3Fi: 'https://example.com/terms-3-fi.pdf',
    termsPdf3Sv: 'https://example.com/terms-3-sv.pdf',
    termsPdf3En: 'https://example.com/terms-3-en.pdf',
    termsPdf4Fi: 'https://example.com/terms-4-fi.pdf',
    termsPdf4Sv: 'https://example.com/terms-4-sv.pdf',
    termsPdf4En: 'https://example.com/terms-4-en.pdf',
  },
} as unknown as Application;

describe('useApplicationFormStep6', () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue('fi');
  });

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

  it.each([
    [
      'fi',
      '# Finnish terms',
      [
        'https://example.com/terms-fi.pdf',
        'https://example.com/terms-2-fi.pdf',
        'https://example.com/terms-3-fi.pdf',
        'https://example.com/terms-4-fi.pdf',
      ],
    ],
    [
      'sv',
      '# Swedish terms',
      [
        'https://example.com/terms-sv.pdf',
        'https://example.com/terms-2-sv.pdf',
        'https://example.com/terms-3-sv.pdf',
        'https://example.com/terms-4-sv.pdf',
      ],
    ],
    [
      'en',
      '# English terms',
      [
        'https://example.com/terms-en.pdf',
        'https://example.com/terms-2-en.pdf',
        'https://example.com/terms-3-en.pdf',
        'https://example.com/terms-4-en.pdf',
      ],
    ],
  ])(
    'returns localized terms markdown and all PDF URLs for %s locale',
    (locale, expectedMarkdown, expectedUrls) => {
      mockUseLocale.mockReturnValue(locale);
      const setIsSubmittedApplication = jest.fn();

      const { result } = renderHook(() =>
        useApplicationFormStep6(applicationWithTerms, setIsSubmittedApplication)
      );

      expect(result.current.applicantTermsInEffectMd).toBe(expectedMarkdown);
      expect([
        result.current.applicantTermsInEffectUrl,
        result.current.applicantTerms2InEffectUrl,
        result.current.applicantTerms3InEffectUrl,
        result.current.applicantTerms4InEffectUrl,
      ]).toEqual(expectedUrls);
    }
  );

  it('returns undefined for terms markdown and PDF URLs when applicant terms are missing', () => {
    const setIsSubmittedApplication = jest.fn();

    const { result } = renderHook(() =>
      useApplicationFormStep6(baseApplication, setIsSubmittedApplication)
    );

    expect(result.current.applicantTermsInEffectMd).toBeUndefined();
    expect(result.current.applicantTermsInEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms2InEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms3InEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms4InEffectUrl).toBeUndefined();
  });

  it('returns undefined for terms markdown and PDF URLs when locale is unsupported', () => {
    mockUseLocale.mockReturnValue('de');
    const setIsSubmittedApplication = jest.fn();

    const { result } = renderHook(() =>
      useApplicationFormStep6(applicationWithTerms, setIsSubmittedApplication)
    );

    expect(result.current.applicantTermsInEffectMd).toBeUndefined();
    expect(result.current.applicantTermsInEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms2InEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms3InEffectUrl).toBeUndefined();
    expect(result.current.applicantTerms4InEffectUrl).toBeUndefined();
  });
});
