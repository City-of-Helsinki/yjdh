import 'benefit/applicant/__tests__/utils/mock-hds-date-input';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import DeMinimisAidForm from 'benefit/applicant/components/applications/forms/application/deMinimisAid/DeMinimisAidForm';
import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import React from 'react';
import { stringFloatToFixed } from 'shared/utils/string.utils';

import i18n from '../../../../../../../test/i18n/i18n-test';
import { useDeminimisAid } from '../useDeminimisAid';

jest.mock(
  'benefit/applicant/components/applications/forms/application/deMinimisAid/useDeminimisAid'
);
jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));

type FormValues = {
  granter: string;
  amount: string;
  grantedAt: string;
};

type FormikMock = {
  values: FormValues;
  isValid: boolean;
  handleBlur: jest.Mock;
  handleChange: jest.Mock;
  setFieldValue: jest.Mock;
};

type UseDeminimisAidMockReturn = {
  t: (key: string) => string;
  handleSubmit: jest.Mock;
  getErrorMessage: (fieldName: string) => string;
  fields: {
    granter: { name: string; label: string; placeholder: string };
    amount: { name: string; label: string; placeholder: string };
    grantedAt: { name: string; label: string; placeholder: string };
  };
  translationsBase: string;
  formik: FormikMock;
  grants: Array<{ amount: number }>;
};

const mockUseDeminimisAid = useDeminimisAid as jest.Mock;

const translationsBase = 'common:applications.sections.company';
const t = i18n.t.bind(i18n);
const normalizedHeadingText =
  'Täytä alle kaikki organisaatiolle myönnetyt de minimis -tuet kuluvan vuoden ja kahden edellisen verovuoden ajalta. Halutessasi voit ilmoittaa saamasi saman kalenterivuoden tuet yhteenlaskettuna yhdellä rivillä.';
const addButtonText = 'Tallenna';

const fields = {
  granter: {
    name: DE_MINIMIS_AID_KEYS.GRANTER,
    label: 'Tuen myöntäjä',
    placeholder: 'Myöntävä taho',
  },
  amount: {
    name: DE_MINIMIS_AID_KEYS.AMOUNT,
    label: 'Tuen määrä',
    placeholder: '€',
  },
  grantedAt: {
    name: DE_MINIMIS_AID_KEYS.GRANTED_AT,
    label: 'Myöntämispäivämäärä',
    placeholder: 'Valitse',
  },
};

const createHookReturn = (
  overrides: Partial<UseDeminimisAidMockReturn> = {}
): UseDeminimisAidMockReturn => {
  const defaultFormik: FormikMock = {
    values: {
      granter: '',
      amount: '',
      grantedAt: '',
    },
    isValid: true,
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    setFieldValue: jest.fn(),
  };

  const mergedFormik: FormikMock = {
    ...defaultFormik,
    ...overrides.formik,
    values: {
      ...defaultFormik.values,
      ...overrides.formik?.values,
    },
  };

  return {
    t,
    handleSubmit: jest.fn(),
    getErrorMessage: jest.fn(() => ''),
    fields,
    translationsBase,
    grants: [],
    ...overrides,
    formik: mergedFormik,
  };
};

const setupHook = (
  overrides: Partial<UseDeminimisAidMockReturn> = {}
): UseDeminimisAidMockReturn => {
  const hookReturn = createHookReturn(overrides);
  mockUseDeminimisAid.mockReturnValue(hookReturn);
  return hookReturn;
};

const renderForm = (
  setUnfinishedDeMinimisAid: React.Dispatch<
    React.SetStateAction<boolean>
  > = jest.fn()
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <DeMinimisAidForm
      data={[]}
      setUnfinishedDeMinimisAid={setUnfinishedDeMinimisAid}
    />
  );

const getGranterInput = (): HTMLElement =>
  screen.getByRole('textbox', { name: /Tuen myontaja|Tuen myöntäjä/u });

const getAmountInput = (): HTMLElement =>
  screen.getByRole('textbox', { name: /Tuen maara|Tuen määrä/u });

const getGrantedAtInput = (): HTMLElement =>
  screen.getByRole('textbox', {
    name: /Myontamispaivamaara|Myöntämispäivämäärä/u,
  });

const getAddButton = (): HTMLElement =>
  screen.getByRole('button', { name: addButtonText });

const blurGranterInput = async (
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  await user.click(getGranterInput());
  await user.tab();
};

const blurAmountInput = async (
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  await user.click(getAmountInput());
  await user.tab();
};

const blurGrantedAtInput = async (
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  await user.click(getGrantedAtInput());
  await user.tab();
};

describe('DeMinimisAidForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupHook();
  });

  it('renders heading, fields and add button', () => {
    renderForm();

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      normalizedHeadingText
    );
    expect(getGranterInput()).toBeInTheDocument();
    expect(getAmountInput()).toBeInTheDocument();
    expect(getGrantedAtInput()).toBeInTheDocument();
    expect(getAddButton()).toBeInTheDocument();
  });

  it('calls setFieldValue with fixed amount when amount input changes', async () => {
    const hookReturn = setupHook();
    const user = setupUserAndRender(() => renderForm());
    const amountInput = getAmountInput();

    await user.click(amountInput);
    await user.paste('12,3456');

    expect(hookReturn.formik.setFieldValue).toHaveBeenCalledWith(
      DE_MINIMIS_AID_KEYS.AMOUNT,
      stringFloatToFixed('12,3456')
    );
  });

  it('calls setFieldValue for grantedAt when date input changes', async () => {
    const hookReturn = setupHook();
    const user = setupUserAndRender(() => renderForm());

    await user.click(getGrantedAtInput());
    await user.paste('15.1.2024');

    expect(hookReturn.formik.setFieldValue).toHaveBeenCalledWith(
      DE_MINIMIS_AID_KEYS.GRANTED_AT,
      '15.1.2024'
    );
  });

  it('marks de minimis as unfinished on blur when any field has content', async () => {
    const setUnfinishedDeMinimisAid = jest.fn();
    const hookReturn = setupHook({
      formik: {
        values: {
          granter: 'Business Finland',
          amount: '',
          grantedAt: '',
        },
      } as FormikMock,
    });
    const user = setupUserAndRender(() =>
      renderForm(setUnfinishedDeMinimisAid)
    );

    await blurGranterInput(user);

    expect(setUnfinishedDeMinimisAid).toHaveBeenNthCalledWith(1, false);
    expect(setUnfinishedDeMinimisAid).toHaveBeenNthCalledWith(2, true);
    expect(hookReturn.formik.handleBlur).toHaveBeenCalled();
  });

  it('does not mark de minimis as unfinished on blur when all fields are empty', async () => {
    const setUnfinishedDeMinimisAid = jest.fn();
    const hookReturn = setupHook({
      formik: {
        values: {
          granter: '',
          amount: '',
          grantedAt: '',
        },
      } as FormikMock,
    });
    const user = setupUserAndRender(() =>
      renderForm(setUnfinishedDeMinimisAid)
    );

    await blurGranterInput(user);

    expect(setUnfinishedDeMinimisAid).toHaveBeenCalledWith(false);
    expect(setUnfinishedDeMinimisAid).not.toHaveBeenCalledWith(true);
    expect(hookReturn.formik.handleBlur).toHaveBeenCalled();
  });

  it('forwards date input blur to formik.handleBlur', async () => {
    const hookReturn = setupHook();
    const user = setupUserAndRender(() => renderForm());

    await blurGrantedAtInput(user);

    expect(hookReturn.formik.handleBlur).toHaveBeenCalled();
  });

  it('forwards amount input blur to formik.handleBlur', async () => {
    const hookReturn = setupHook();
    const user = setupUserAndRender(() => renderForm());

    await blurAmountInput(user);

    expect(hookReturn.formik.handleBlur).toHaveBeenCalled();
  });

  it('marks de minimis as unfinished on date blur when date field has content', async () => {
    const setUnfinishedDeMinimisAid = jest.fn();
    const hookReturn = setupHook({
      formik: {
        values: {
          granter: '',
          amount: '',
          grantedAt: '15.1.2024',
        },
      } as FormikMock,
    });
    const user = setupUserAndRender(() =>
      renderForm(setUnfinishedDeMinimisAid)
    );

    await blurGrantedAtInput(user);

    expect(setUnfinishedDeMinimisAid).toHaveBeenNthCalledWith(1, false);
    expect(setUnfinishedDeMinimisAid).toHaveBeenNthCalledWith(2, true);
    expect(hookReturn.formik.handleBlur).toHaveBeenCalled();
  });

  it('calls submit handler and clears unfinished marker when add is clicked', async () => {
    const setUnfinishedDeMinimisAid = jest.fn();
    const handleSubmit = jest.fn();
    setupHook({
      handleSubmit,
      formik: {
        values: {
          granter: 'City of Helsinki',
          amount: '1000',
          grantedAt: '15.1.2024',
        },
        isValid: true,
      } as FormikMock,
    });
    const user = setupUserAndRender(() =>
      renderForm(setUnfinishedDeMinimisAid)
    );

    await user.click(getAddButton());

    expect(setUnfinishedDeMinimisAid).toHaveBeenCalledWith(false);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it.each([
    {
      testName: 'disables add button when required values are missing',
      formik: {
        values: {
          granter: 'City of Helsinki',
          amount: '',
          grantedAt: '15.1.2024',
        },
        isValid: true,
      },
      grants: [],
      expectedDisabled: true,
    },
    {
      testName: 'disables add button when form is invalid',
      formik: {
        values: {
          granter: 'City of Helsinki',
          amount: '1000',
          grantedAt: '15.1.2024',
        },
        isValid: false,
      },
      grants: [],
      expectedDisabled: true,
    },
    {
      testName: 'disables add button when total amount exceeds max',
      formik: {
        values: {
          granter: 'City of Helsinki',
          amount: '1000',
          grantedAt: '15.1.2024',
        },
        isValid: true,
      },
      grants: [{ amount: MAX_DEMINIMIS_AID_TOTAL_AMOUNT + 1 }],
      expectedDisabled: true,
    },
    {
      testName: 'enables add button when values are complete and valid',
      formik: {
        values: {
          granter: 'City of Helsinki',
          amount: '1000',
          grantedAt: '15.1.2024',
        },
        isValid: true,
      },
      grants: [{ amount: MAX_DEMINIMIS_AID_TOTAL_AMOUNT - 1 }],
      expectedDisabled: false,
    },
  ])('$testName', ({ formik, grants, expectedDisabled }) => {
    setupHook({
      formik: formik as FormikMock,
      grants,
    });

    renderForm();

    const addButton = getAddButton();

    if (expectedDisabled) {
      expect(addButton).toBeDisabled();
    } else {
      expect(addButton).toBeEnabled();
    }
  });
});
