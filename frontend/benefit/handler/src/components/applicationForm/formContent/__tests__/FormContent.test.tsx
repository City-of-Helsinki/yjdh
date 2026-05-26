import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import {
  APPLICATION_FIELD_KEYS,
} from 'benefit/handler/constants';
import { useApplicationFormContext } from 'benefit/handler/hooks/useApplicationFormContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import {
  APPLICATION_ORIGINS,
  BENEFIT_TYPES,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { FormikProps } from 'formik';
import React from 'react';

import FormContent from '../FormContent';

jest.mock('benefit/handler/hooks/useAlertBeforeLeaving', () => ({
  useAlertBeforeLeaving: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useApplicationFormContext', () => ({
  useApplicationFormContext: jest.fn(),
}));

jest.mock('benefit/handler/hooks/useDependentFieldsEffect', () => ({
  useDependentFieldsEffect: jest.fn(),
}));

jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');

  return {
    __esModule: true,
    ...actual,
    default: actual.default ?? actual,
    useTheme: () => ({
      spacing: {
        s: '8px',
        l: '24px',
        xl: '32px',
      },
      colors: {
        silver: '#dedfe1',
      },
    }),
  };
});

jest.mock('../useFormContent', () => ({
  useFormContent: () => ({
    t: (key: string) => key,
    languageOptions: [
      { label: 'Suomi', value: 'fi' },
      { label: 'English', value: 'en' },
    ],
    translationsBase: 'common:applications.sections',
    language: 'fi',
    cbPrefix: 'consent',
    textLocale: 'Fi',
    clearDeminimisAids: jest.fn(),
    clearBenefitValues: jest.fn(),
    clearDatesValues: jest.fn(),
    clearCommissionValues: jest.fn(),
    clearContractValues: jest.fn(),
    clearAlternativeAddressValues: jest.fn(),
    getErrorMessage: (fieldName: string) =>
      fieldName ===
      APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT
        ? 'other financial support error'
        : fieldName === APPLICATION_FIELD_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION
        ? 'role error'
        : undefined,
    displayPastApplicationDatesWarning: () => false,
    dateInputLimits: {
      max: new Date(),
    },
  }),
}));

jest.mock('../companySection/CompanySection', () => ({
  __esModule: true,
  default: () => <div data-testid="company-section" />,
}));

jest.mock('../attachmentsList/AttachmentsList', () => ({
  __esModule: true,
  default: () => <div data-testid="attachments-list" />,
}));

jest.mock('shared/components/forms/heading/Heading', () => ({
  __esModule: true,
  default: ({
    header,
    as: Component = 'h3',
  }: {
    header: string;
    as?: keyof JSX.IntrinsicElements;
  }) => <Component>{header}</Component>,
}));

jest.mock('shared/components/forms/fields/fieldLabel/FieldLabel', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => <span>{value}</span>,
}));

jest.mock('shared/components/forms/fields/Fields.sc', () => ({
  $Checkbox: ({
    id,
    name,
    label,
    checked,
    errorText,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    checked?: boolean;
    errorText?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
      />
      {errorText && <span>{errorText}</span>}
    </>
  ),
  $RadioButton: ({
    id,
    name,
    label,
    value,
    checked,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    value: string;
    checked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
      />
    </>
  ),
}));

jest.mock('shared/components/forms/section/FormSection', () => ({
  __esModule: true,
  default: ({
    children,
    header,
  }: {
    children: React.ReactNode;
    header: string;
  }) => (
    <section>
      <h2>{header}</h2>
      {children}
    </section>
  ),
}));

jest.mock('shared/components/forms/section/FormSection.sc', () => ({
  $Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  $GridCell: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div id={id}>{children}</div>
  ),
}));

jest.mock('../FormContent.sc', () => ({
  $DateHeader: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  $Description: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  $HelpText: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('hds-react', () => ({
  DateInput: ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
      />
    </>
  ),
  Notification: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <div>
      <strong>{label}</strong>
      {children}
    </div>
  ),
  SelectionGroup: ({
    children,
    label,
    errorText,
  }: {
    children: React.ReactNode;
    label: string;
    errorText?: string;
  }) => (
    <fieldset>
      <legend>{label}</legend>
      {errorText && <span>{errorText}</span>}
      {children}
    </fieldset>
  ),
  TextArea: ({
    id,
    name,
    label,
    value,
    errorText,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    value?: string;
    errorText?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  }) => (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
      {errorText && <span>{errorText}</span>}
    </>
  ),
  TextInput: ({
    id,
    name,
    label,
    value,
    errorText,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    value?: string;
    errorText?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
      {errorText && <span>{errorText}</span>}
    </>
  ),
}));

jest.mock('shared/utils/string.utils', () => ({
  formatStringFloatValue: (value?: string | number | null) =>
    value === undefined || value === null ? '' : String(value),
  stringFloatToFixed: (value: string) => value,
}));

const field = (
  name: string
): {
  name: string;
  label: string;
  placeholder: string;
} => ({
  name,
  label: `${name}.label`,
  placeholder: `${name}.placeholder`,
});

const fields = {
  ...Object.fromEntries(
    Object.values(APPLICATION_FIELD_KEYS).map((key) => [key, field(key)])
  ),
  employee: {
    ...Object.fromEntries(
      Object.values(EMPLOYEE_KEYS).map((key) => [
        key,
        field(`${APPLICATION_FIELD_KEYS.EMPLOYEE}.${key}`),
      ])
    ),
  },
} as unknown as ApplicationFields;

const baseApplication = {
  applicationOrigin: APPLICATION_ORIGINS.HANDLER,
  company: {
    id: 'company-id',
    name: 'Company',
    businessId: '1234567-8',
    companyForm: 'OY',
    streetAddress: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
    organizationType: ORGANIZATION_TYPES.COMPANY,
  },
  applicantTermsInEffect: {
    id: 'terms-id',
    effectiveFrom: '2024-01-01',
    termsType: 'handler',
    applicantConsents: [],
  },
} as unknown as Application;

const createFormik = (
  values: Partial<Application> = {}
): FormikProps<Partial<Application>> =>
  ({
    dirty: false,
    values: {
      employee: {
        firstName: '',
        lastName: '',
        socialSecurityNumber: '',
        isLivingInHelsinki: false,
        jobTitle: '',
        workingHours: '',
        collectiveBargainingAgreement: '',
        monthlyPay: '',
        vacationMoney: '',
        otherExpenses: '',
      },
      otherFinancialSupportForEmployment: null,
      roleOfEmployeeInOrganization: '',
      benefitType: BENEFIT_TYPES.SALARY,
      ...values,
    },
    touched: {},
    errors: {},
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    setFieldValue: jest.fn(),
  } as unknown as FormikProps<Partial<Application>>);

const defaultProps = {
  application: baseApplication,
  formik: createFormik(),
  fields,
  handleSave: jest.fn(),
  handleQuietSave: jest.fn(),
  showDeminimisSection: false,
  minEndDate: new Date(),
  maxEndDate: undefined,
  setEndDate: jest.fn(),
  deMinimisAidSet: [],
  attachments: [],
  checkedConsentArray: [],
  getConsentErrorText: jest.fn(),
  handleConsentClick: jest.fn(),
};

const renderComponent = (
  props: Partial<React.ComponentProps<typeof FormContent>> = {}
): RenderResult => {
  (useApplicationFormContext as jest.Mock).mockReturnValue({
    isFormActionNew: false,
  });

  return render(<FormContent {...defaultProps} {...props} />);
};

describe('FormContent new fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders otherFinancialSupportForEmployment radio group with no and yes options', () => {
    renderComponent();

    expect(
      screen.getByText('otherFinancialSupportForEmployment.label')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('common:utility.no')).toHaveAttribute(
      'name',
      APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT
    );
    expect(screen.getByLabelText('common:utility.yes')).toHaveAttribute(
      'name',
      APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT
    );
  });

  it('sets otherFinancialSupportForEmployment to false when no is selected', () => {
    const formik = createFormik();
    renderComponent({ formik });

    fireEvent.click(screen.getByLabelText('common:utility.no'));

    expect(formik.setFieldValue).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
      false
    );
  });

  it('sets otherFinancialSupportForEmployment to true when yes is selected', () => {
    const formik = createFormik();
    renderComponent({ formik });

    fireEvent.click(screen.getByLabelText('common:utility.yes'));

    expect(formik.setFieldValue).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
      true
    );
  });

  it('renders roleOfEmployeeInOrganization textarea with current value and error text', () => {
    renderComponent({
      formik: createFormik({
        roleOfEmployeeInOrganization: 'Employee role description',
      }),
    });

    expect(
      screen.getByLabelText('roleOfEmployeeInOrganization.label')
    ).toHaveValue('Employee role description');
    expect(screen.getByText('role error')).toBeInTheDocument();
  });
});
