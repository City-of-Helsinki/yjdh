import { renderHook, waitFor } from '@testing-library/react';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import * as Yup from 'yup';

import { useApplicationFormStep1 } from '../useApplicationFormStep1';

// Mock dependencies
jest.mock('benefit/applicant/hooks/useCompanyQuery');
jest.mock('benefit/applicant/hooks/useFormActions');
jest.mock('benefit/applicant/i18n');
jest.mock('benefit/applicant/utils/common');
jest.mock('shared/hooks/useLocale');
jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

// Mock the validation schema with a proper Yup schema
jest.mock('../utils/validation', () => ({
  getValidationSchema: jest.fn(() =>
    Yup.object().shape({
      companyContactPersonFirstName: Yup.string(),
      companyContactPersonLastName: Yup.string(),
      companyContactPersonEmail: Yup.string().email(),
      companyContactPersonPhoneNumber: Yup.string(),
      deMinimisAid: Yup.boolean().nullable(),
    })
  ),
}));

const mockUseCompanyQuery = useCompanyQuery as jest.MockedFunction<
  typeof useCompanyQuery
>;
const mockUseFormActions = useFormActions as jest.MockedFunction<
  typeof useFormActions
>;
const mockUseTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;
const mockGetLanguageOptions = getLanguageOptions as jest.MockedFunction<
  typeof getLanguageOptions
>;
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;

describe('useApplicationFormStep1', () => {
  const mockApplication: Partial<Application> = {
    id: 'test-id',
    companyContactPersonFirstName: 'John',
    companyContactPersonLastName: 'Doe',
    deMinimisAidSet: [],
  };

  const mockFormActions = {
    onNext: jest.fn().mockResolvedValue({}),
    onSave: jest.fn().mockResolvedValue({}),
    onQuietSave: jest.fn().mockResolvedValue({}),
    onDelete: jest.fn(),
    onBack: jest.fn().mockResolvedValue({}),
  };

  const mockSetDeMinimisAids = jest.fn();
  const mockT = jest.fn((key: string) => key);

  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => (
    <DeMinimisContext.Provider
      value={{
        deMinimisAids: [],
        setDeMinimisAids: mockSetDeMinimisAids,
      }}
    >
      {children}
    </DeMinimisContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.COMPANY,
      },
    } as unknown as ReturnType<typeof useCompanyQuery>);

    mockUseFormActions.mockReturnValue(mockFormActions);

    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as unknown,
    } as unknown as ReturnType<typeof useTranslation>);

    mockGetLanguageOptions.mockReturnValue([
      { label: 'Finnish', value: 'fi' },
      { label: 'Swedish', value: 'sv' },
      { label: 'English', value: 'en' },
    ]);

    mockUseLocale.mockReturnValue('fi');
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(
      () => useApplicationFormStep1(mockApplication, false),
      { wrapper }
    );

    expect(result.current.translationsBase).toBe(
      'common:applications.sections.company'
    );
    expect(result.current.deMinimisAidSet).toEqual([]);
    expect(result.current.formik).toBeDefined();
    expect(result.current.fields).toBeDefined();
  });

  it('should show de minimis section when organization is a company', () => {
    const { result } = renderHook(
      () => useApplicationFormStep1(mockApplication, false),
      { wrapper }
    );

    expect(result.current.showDeminimisSection).toBe(true);
  });

  it('should show de minimis section when association has business activities', () => {
    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.ASSOCIATION,
      },
    } as unknown as ReturnType<typeof useCompanyQuery>);

    const applicationWithActivities: Partial<Application> = {
      ...mockApplication,
      associationHasBusinessActivities: true,
    };

    const { result } = renderHook(
      () => useApplicationFormStep1(applicationWithActivities, false),
      { wrapper }
    );

    expect(result.current.showDeminimisSection).toBe(true);
  });

  it('should hide de minimis section when association has no business activities', () => {
    mockUseCompanyQuery.mockReturnValue({
      data: {
        organization_type: ORGANIZATION_TYPES.ASSOCIATION,
      },
    } as unknown as ReturnType<typeof useCompanyQuery>);

    const applicationWithoutActivities: Partial<Application> = {
      ...mockApplication,
      associationHasBusinessActivities: false,
    };

    const { result } = renderHook(
      () => useApplicationFormStep1(applicationWithoutActivities, false),
      { wrapper }
    );

    expect(result.current.showDeminimisSection).toBe(false);
  });

  it('should handle form submission correctly', async () => {
    const { result } = renderHook(
      () => useApplicationFormStep1(mockApplication, false),
      { wrapper }
    );

    result.current.handleSubmit();

    await waitFor(() => {
      expect(mockFormActions.onNext).toHaveBeenCalled();
    });
  });

  it('should clear de minimis aids when clearDeminimisAids is called', async () => {
    const { result } = renderHook(
      () => useApplicationFormStep1(mockApplication, false),
      { wrapper }
    );

    result.current.clearDeminimisAids();

    await waitFor(() => {
      expect(mockSetDeMinimisAids).toHaveBeenCalledWith([]);
    });
  });

  it('should return correct language options and default language', () => {
    const applicationWithLanguage: Partial<Application> = {
      ...mockApplication,
      applicantLanguage: 'sv' as const,
    };

    const { result } = renderHook(
      () => useApplicationFormStep1(applicationWithLanguage, false),
      { wrapper }
    );

    expect(result.current.languageOptions).toHaveLength(3);
    expect(result.current.getDefaultLanguage()).toEqual({
      label: 'Swedish',
      value: 'sv',
    });
  });
});
