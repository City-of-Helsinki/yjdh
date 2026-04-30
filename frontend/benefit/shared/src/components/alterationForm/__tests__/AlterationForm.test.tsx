import renderComponent from 'benefit-shared/__tests__/utils/render-component';
import AlterationForm, {
  isDateInHandledRecoveryRange,
} from 'benefit-shared/components/alterationForm/AlterationForm';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import AlterationFormContext, {
  AlterationFormContextType,
} from 'benefit-shared/context/AlterationFormContext';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import i18n from 'i18next';
import React from 'react';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

const typeDateInput = async (
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  value: string
): Promise<void> => {
  await user.click(input);
  await user.clear(input);
  await user.type(input, value);
  await user.tab();
};

describe('AlterationForm', () => {
  const t = i18n.getFixedT('fi', 'common') as unknown as NonNullable<
    AlterationFormContextType['t']
  >;

  const baseValues: Partial<ApplicationAlteration> = {
    alterationType: ALTERATION_TYPE.TERMINATION,
    endDate: '2024-03-01',
    resumeDate: '',
    reason: 'Reason',
    contactPersonName: 'Contact Person',
    useEinvoice: false,
    einvoiceProviderName: '',
    einvoiceProviderIdentifier: '',
    einvoiceAddress: '',
  };

  const handleChange = jest.fn();
  const handleBlur = jest.fn();
  const setFieldValue = jest.fn();

  const buildFormik = (
    values: Partial<ApplicationAlteration> = baseValues
  ): FormikProps<Partial<ApplicationAlteration>> =>
    ({
      values,
      errors: {},
      touched: {},
      handleChange,
      handleBlur,
      setFieldValue,
    } as unknown as FormikProps<Partial<ApplicationAlteration>>);

  const baseApplication: Application = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    company: {
      streetAddress: 'Test street 1',
      postcode: '00100',
      city: 'Helsinki',
    } as Application['company'],
    alterations: [],
  };

  const TestContextProvider: React.FC<{
    children: React.ReactNode;
    contextOverride?: Partial<AlterationFormContextType>;
  }> = ({ children, contextOverride }) => {
    const contextValue: AlterationFormContextType = {
      t,
      formik: buildFormik(),
      language: 'fi',
      isSubmitted: false,
      isSubmitting: false,
      handleSubmit: null,
      error: null,
      ...contextOverride,
    };

    return (
      <AlterationFormContext.Provider value={contextValue}>
        {children}
      </AlterationFormContext.Provider>
    );
  };

  const renderSubject = (
    contextOverride?: Partial<AlterationFormContextType>,
    applicationOverride?: Partial<Application>
  ): ReturnType<typeof renderComponent> => {
    const application: Application = {
      ...baseApplication,
      ...applicationOverride,
    };

    return renderComponent(
      <TestContextProvider contextOverride={contextOverride}>
        <AlterationForm application={application} />
      </TestContextProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when required context values are missing', () => {
    const { renderResult: { container } } = renderSubject({ formik: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders common fields and hides suspension/einvoice specific fields by default', () => {
    renderSubject();

    expect(
      screen.getByText(t('applications.alterations.new.details'))
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.endDate.label'), 'i'),
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.resumeDate.label'), 'i'),
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.einvoiceProviderName.label'), 'i'),
      })
    ).not.toBeInTheDocument();
  });

  it('renders suspension and einvoice specific fields for matching values', () => {
    renderSubject({
      formik: buildFormik({
        ...baseValues,
        alterationType: ALTERATION_TYPE.SUSPENSION,
        useEinvoice: true,
      }),
    });

    expect(
      screen.getByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.resumeDate.label'), 'i'),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.einvoiceProviderName.label'), 'i'),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.einvoiceProviderIdentifier.label'), 'i'),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: new RegExp(t('applications.alterations.new.fields.einvoiceAddress.label'), 'i'),
      })
    ).toBeInTheDocument();
  });

  it('updates useEinvoice via setFieldValue when invoice radio is clicked', async () => {
    const user = userEvent.setup();
    renderSubject();

    await user.click(
      screen.getByRole('radio', {
        name: t('applications.alterations.new.fields.useEinvoice.yes'),
      })
    );

    expect(setFieldValue).toHaveBeenCalledWith('useEinvoice', true);
  });

  it('updates useEinvoice via setFieldValue when invoice no radio is clicked', async () => {
    const user = userEvent.setup();
    renderSubject({
      formik: buildFormik({
        ...baseValues,
        useEinvoice: true,
      }),
    });

    await user.click(
      screen.getByRole('radio', {
        name: t('applications.alterations.new.fields.useEinvoice.no', {
          streetAddress: baseApplication.company?.streetAddress,
          postCode: baseApplication.company?.postcode,
          city: baseApplication.company?.city,
        }),
      })
    );

    expect(setFieldValue).toHaveBeenCalledWith('useEinvoice', false);
  });

  it('updates end date via setFieldValue when date input changes', async () => {
    const user = userEvent.setup();
    renderSubject();

    const endDateInput = screen.getByRole('textbox', {
      name: new RegExp(t('applications.alterations.new.fields.endDate.label'), 'i'),
    });

    await typeDateInput(user, endDateInput, '2.5.2024');

    expect(setFieldValue).toHaveBeenCalled();
    expect(setFieldValue).toHaveBeenCalledWith('endDate', expect.any(String));
  });

  it('updates resume date via setFieldValue when date input changes', async () => {
    const user = userEvent.setup();
    renderSubject({
      formik: buildFormik({
        ...baseValues,
        alterationType: ALTERATION_TYPE.SUSPENSION,
        endDate: '2024-05-01',
        resumeDate: '2024-05-10',
      }),
    });

    const resumeDateInput = screen.getByRole('textbox', {
      name: new RegExp(t('applications.alterations.new.fields.resumeDate.label'), 'i'),
    });

    await typeDateInput(user, resumeDateInput, '15.5.2024');

    expect(setFieldValue).toHaveBeenCalledWith('resumeDate', expect.any(String));
  });

  it('returns true when date is inside handled recovery range', () => {
    const application: Application = {
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryStartDate: '2024-05-02',
          recoveryEndDate: '2024-05-05',
        } as ApplicationAlteration,
      ],
    };

    expect(isDateInHandledRecoveryRange(application, new Date('2024-05-03'))).toBe(
      true
    );
  });

  it('returns false when date is outside handled recovery range', () => {
    const application: Application = {
      alterations: [
        {
          state: ALTERATION_STATE.HANDLED,
          recoveryStartDate: '2024-05-02',
          recoveryEndDate: '2024-05-05',
        } as ApplicationAlteration,
      ],
    };

    expect(isDateInHandledRecoveryRange(application, new Date('2024-05-06'))).toBe(
      false
    );
  });

  it('returns false when only non-handled alterations match the date range', () => {
    const application: Application = {
      alterations: [
        {
          state: ALTERATION_STATE.RECEIVED,
          recoveryStartDate: '2024-05-02',
          recoveryEndDate: '2024-05-05',
        } as ApplicationAlteration,
      ],
    };

    expect(isDateInHandledRecoveryRange(application, new Date('2024-05-03'))).toBe(
      false
    );
  });

});
