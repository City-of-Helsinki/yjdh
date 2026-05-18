import { act, renderHook,RenderHookResult } from '@testing-library/react-hooks';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import {
  APPLICATION_FIELDS_STEP1_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import { useApplicationFormStep1 } from '../useApplicationFormStep1';

const onNext = jest.fn();
const onSave = jest.fn();
const onDelete = jest.fn();
const onQuietSave = jest.fn();
const setDeMinimisAids = jest.fn();

jest.mock('benefit/applicant/hooks/useFormActions', () => jest.fn());

jest.mock('benefit/applicant/hooks/useCompanyQuery', () => jest.fn());

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));

jest.mock('benefit/applicant/utils/common', () => ({
  getLanguageOptions: jest.fn(() => [
    { label: 'common:languages.fi', value: 'fi' },
    { label: 'common:languages.sv', value: 'sv' },
    { label: 'common:languages.en', value: 'en' },
  ]),
}));

jest.mock('benefit-shared/utils/forms', () => ({
  getErrorText: jest.fn(() => {
    // Intentionally empty mock return
  }),
}));

jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

jest.mock('../utils/validation', () => ({
  getValidationSchema: jest.fn(() => {
    // Intentionally empty mock return
  }),
}));

const mockUseFormActions = useFormActions as jest.MockedFunction<
  typeof useFormActions
>;

const mockUseCompanyQuery = useCompanyQuery as jest.MockedFunction<
  typeof useCompanyQuery
>;

const baseApplication = {
  id: 'application-id',
  applicantLanguage: 'sv',
  deMinimisAidSet: [
    {
      id: 'de-minimis-aid-id',
      granter: 'Granter',
      amount: 100,
      grantedAt: '2024-01-01',
    },
  ],
} as unknown as Partial<Application>;

const getWrapper =
  (): React.FC<{ children: React.ReactNode }> =>
  ({ children }) =>
    (
      <DeMinimisContext.Provider
        value={{
          deMinimisAids: [],
          setDeMinimisAids,
        }}
      >
        {children}
      </DeMinimisContext.Provider>
    );

const renderUseApplicationFormStep1 = (
  application: Partial<Application> = baseApplication,
  isUnfinishedDeminimisAid = false
): RenderHookResult<unknown, ReturnType<typeof useApplicationFormStep1>> =>
  renderHook(
    () => useApplicationFormStep1(application, isUnfinishedDeminimisAid),
    {
      wrapper: getWrapper(),
    }
  );

describe('useApplicationFormStep1', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    onNext.mockResolvedValue();
    onSave.mockResolvedValue();
    onQuietSave.mockResolvedValue();

    mockUseFormActions.mockReturnValue({
      onNext,
      onSave,
      onDelete,
      onQuietSave,
    });

    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.COMPANY,
      },
    } as ReturnType<typeof useCompanyQuery>);
  });

  it('returns translated metadata and form fields', () => {
    const { result } = renderUseApplicationFormStep1();

    expect(result.current.translationsBase).toBe(
      'common:applications.sections.company'
    );
    expect(result.current.fields.companyBankAccountNumber.name).toBe(
      APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER
    );
    expect(result.current.fields.companyBankAccountNumber.label).toBe(
      'common:applications.sections.company.fields.companyBankAccountNumber.label'
    );
    expect(result.current.fields.companyBankAccountNumber.placeholder).toBe(
      'common:applications.sections.company.fields.companyBankAccountNumber.placeholder'
    );
  });

  it('returns bank account mask configuration that strips whitespace', () => {
    const { result } = renderUseApplicationFormStep1();

    expect(result.current.fields.companyBankAccountNumber.mask?.format).toBe(
      'FI99 9999 9999 9999 99'
    );
    expect(
      result.current.fields.companyBankAccountNumber.mask?.stripVal(
        'FI12 3456 7890'
      )
    ).toBe('FI1234567890');
  });

  it('quiet-saves once when application does not have an id', () => {
    renderUseApplicationFormStep1({ applicantLanguage: 'fi' });

    expect(onQuietSave).toHaveBeenCalledTimes(1);
    expect(onQuietSave).toHaveBeenCalledWith({ applicantLanguage: 'fi' });
  });

  it('does not quiet-save when application already has an id', () => {
    renderUseApplicationFormStep1(baseApplication);

    expect(onQuietSave).not.toHaveBeenCalled();
  });

  it('shows de minimis section for company organization type', () => {
    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.COMPANY,
      },
    } as ReturnType<typeof useCompanyQuery>);

    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      associationHasBusinessActivities: false,
    } as Partial<Application>);

    expect(result.current.showDeminimisSection).toBe(true);
  });

  it('shows de minimis section when association has business activities', () => {
    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.ASSOCIATION,
      },
    } as ReturnType<typeof useCompanyQuery>);

    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      associationHasBusinessActivities: true,
    } as Partial<Application>);

    expect(result.current.showDeminimisSection).toBe(true);
  });

  it('hides de minimis section when organization is not company and has no business activities', () => {
    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.ASSOCIATION,
      },
    } as ReturnType<typeof useCompanyQuery>);

    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      associationHasBusinessActivities: false,
    } as Partial<Application>);

    expect(result.current.showDeminimisSection).toBe(false);
  });

  it('returns application language as default language when available', () => {
    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      applicantLanguage: 'sv',
    } as Partial<Application>);

    expect(result.current.getDefaultLanguage()).toEqual({
      label: 'common:languages.sv',
      value: 'sv',
    });
  });

  it('falls back to current locale as default language', () => {
    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      applicantLanguage: undefined,
    } as Partial<Application>);

    expect(result.current.getDefaultLanguage()).toEqual({
      label: 'common:languages.fi',
      value: 'fi',
    });
  });

  it('clears de minimis aids and resets deMinimisAid field', async () => {
    const { result } = renderUseApplicationFormStep1({
      id: 'application-id',
      deMinimisAid: true,
    } as Partial<Application>);

    await act(async () => {
      result.current.clearDeminimisAids();
    });

    expect(setDeMinimisAids).toHaveBeenCalledWith([]);
    expect(result.current.formik.values.deMinimisAid).toBeNull();
  });

  it('does not save when de minimis aid is unfinished', () => {
    const { result } = renderUseApplicationFormStep1(baseApplication, true);

    result.current.handleSave();

    expect(onSave).not.toHaveBeenCalled();
  });
});
