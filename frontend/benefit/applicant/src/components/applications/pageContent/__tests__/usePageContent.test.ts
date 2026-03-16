import { act, renderHook } from '@testing-library/react-hooks';

import { usePageContent } from '../usePageContent';

jest.mock('benefit/applicant/hooks/useApplicationQuery', () =>
  jest.fn(() => ({ status: 'idle', data: undefined, error: null }))
);

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('benefit/applicant/utils/applications', () => ({
  isApplicationEditable: jest.fn(() => true),
}));

jest.mock('benefit/applicant/utils/common', () => ({
  getApplicationStepFromString: jest.fn(() => 1),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    isReady: true,
    locale: 'fi',
    asPath: '/',
    push: jest.fn(),
  }),
}));

describe('usePageContent', () => {
  it('returns isResubmission as false initially', () => {
    const { result } = renderHook(() => usePageContent());
    expect(result.current.isResubmission).toBe(false);
  });

  it('setIsResubmission updates isResubmission state', () => {
    const { result } = renderHook(() => usePageContent());

    act(() => {
      result.current.setIsResubmission(true);
    });

    expect(result.current.isResubmission).toBe(true);
  });
});
