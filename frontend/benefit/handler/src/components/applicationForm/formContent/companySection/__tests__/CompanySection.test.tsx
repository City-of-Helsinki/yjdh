import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import {
  APPLICATION_FIELD_KEYS,
} from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES, ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { FormikProps } from 'formik';
import React from 'react';
import { BenefitAttachment } from 'shared/types/attachment';

import CompanySection from '../CompanySection';

jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');

  return {
    __esModule: true,
    ...actual,
    default: actual.default ?? actual,
    useTheme: () => ({
      spacing: {
        s: '8px',
        m: '16px',
        l: '24px',
        xl: '32px',
      },
      colors: {
        silver: '#dedfe1',
      },
      components: {
        radio: {},
      },
    }),
  };
});

jest.mock('hds-react', () => ({
  IconCheckCircleFill: () => <span data-testid="check-icon" />,
  Select: ({
    id,
    label,
    onChange,
    options,
  }: {
    id: string;
    label: string;
    onChange: (option: { label: string; value: string }) => void;
    options: { label: string; value: string }[];
  }) => (
    <select
      id={id}
      aria-label={label}
      onChange={(event) => {
        const option = options.find(
          (item) => item.value === event.target.value
        );
        if (option) {
          onChange(option);
        }
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
    helperText,
    errorText,
    onChange,
    onBlur,
  }: {
    id: string;
    name: string;
    label: string;
    value?: string;
    helperText?: string;
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
        aria-describedby={helperText}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={!onChange}
      />
      {helperText && <span>{helperText}</span>}
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
        readOnly={!onChange}
      />
      {errorText && <span>{errorText}</span>}
    </>
  ),
}));

jest.mock('react-input-mask', () => ({
  __esModule: true,
  default: ({
    children,
    value,
    onChange,
    onBlur,
  }: {
    children:
      | React.ReactNode
      | ((props: Record<string, unknown>) => React.ReactNode);
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) =>
    typeof children === 'function'
      ? children({ value, onChange, onBlur })
      : children,
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
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
      />
      {errorText && <span>{errorText}</span>}
    </label>
  ),
  $RadioButton: ({
    id,
    name,
    label,
    value,
    checked,
    onChange,
  }: {
    id: string;
    name: string;
    label: string;
    value: string;
    checked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  }) => (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
      />
    </label>
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

jest.mock('../CompanySection.sc', () => ({
  $CompanyInfoLabel: ({ children }: { children: React.ReactNode }) => (
    <dt>{children}</dt>
  ),
  $CompanyInfoValue: ({ children }: { children: React.ReactNode }) => (
    <dd>{children}</dd>
  ),
  $CompanyInfoWrapper: ({ children }: { children: React.ReactNode }) => (
    <dl>{children}</dl>
  ),
  $IconWrapper: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('../../FormContent.sc', () => ({
  $HelpText: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('../../attachmentsList/AttachmentsList', () => ({
  __esModule: true,
  default: ({
    attachmentType,
    attachments,
  }: {
    attachmentType: ATTACHMENT_TYPES;
    attachments?: BenefitAttachment[];
  }) => (
    <div
      data-testid="attachments-list"
      data-attachment-type={attachmentType}
      data-attachments-count={attachments?.length ?? 0}
    />
  ),
}));

jest.mock('../deMinimisAid/DeMinimisAidForm', () => ({
  __esModule: true,
  default: () => <div data-testid="de-minimis-aid-form" />,
}));

jest.mock('../deMinimisAid/list/DeMinimisAidsList', () => ({
  __esModule: true,
  default: () => <div data-testid="de-minimis-aids-list" />,
}));

const translationsBase = 'common:applications.sections';

const t = ((key: string) => key) as never;

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
  ...Object.fromEntries(Object.values(APPLICATION_FIELD_KEYS).map(
    ( key) => [key, field(key)]
  )),
  employee: {},
  companyBankAccountNumber: {
    ...field(APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER),
    mask: {
      format: 'FI99 9999 9999 9999 99',
      stripVal: (value: string) => value.replace(/\s/g, ''),
    },
  },
} as ApplicationFields;

const baseApplication = {
  company: {
    name: 'Test Company',
    businessId: '1234567-8',
    streetAddress: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
    companyForm: 'OY',
    organizationType: ORGANIZATION_TYPES.COMPANY,
  },
} as Application;

const baseFormik = {
  values: {
    useAlternativeAddress: false,
    companyBankAccountNumber: '',
    companyNumberOfEmployees: '',
    companyBusinessBrief: '',
    deMinimisAid: false,
    attachments: [
      {
        id: 'attachment-id',
        attachmentType: ATTACHMENT_TYPES.BUSINESS_BRIEF,
        attachmentFileName: 'business-brief.pdf',
        attachmentFile: '/business-brief.pdf',
      },
    ],
  },
  handleBlur: jest.fn(),
  handleChange: jest.fn(),
  setFieldValue: jest.fn(),
} as unknown as FormikProps<Partial<Application>>;

const renderComponent = ({
  application = baseApplication,
  formik = baseFormik,
  getErrorMessage = jest.fn(),
  showDeminimisSection = false,
}: {
  application?: Application;
  formik?: FormikProps<Partial<Application>>;
  getErrorMessage?: (fieldName: string) => string | undefined;
  showDeminimisSection?: boolean;
} = {}): RenderResult => {
  const setDeMinimisAids = jest.fn();

  return render(
    <DeMinimisContext.Provider value={{ setDeMinimisAids } as never}>
      <CompanySection
        t={t}
        translationsBase={translationsBase}
        application={application}
        formik={formik}
        fields={fields}
        getErrorMessage={getErrorMessage}
        languageOptions={[
          { label: 'Suomi', value: 'fi' },
          { label: 'English', value: 'en' },
        ]}
        showDeminimisSection={showDeminimisSection}
        deMinimisAidSet={[]}
      />
    </DeMinimisContext.Provider>
  );
};

describe('CompanySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders companyNumberOfEmployees input with the current value', () => {
    renderComponent({
      formik: {
        ...baseFormik,
        values: {
          ...baseFormik.values,
          companyNumberOfEmployees: 100,
        },
      } as FormikProps<Partial<Application>>,
    });

    expect(screen.getByLabelText('companyNumberOfEmployees.label')).toHaveValue(
      '100'
    );
  });

  it('strips non-digits when companyNumberOfEmployees changes', () => {
    const setFieldValue = jest.fn();

    renderComponent({
      formik: {
        ...baseFormik,
        setFieldValue,
      } as unknown as FormikProps<Partial<Application>>,
    });

    fireEvent.change(screen.getByLabelText('companyNumberOfEmployees.label'), {
      target: { value: '12abc34' },
    });

    expect(setFieldValue).toHaveBeenCalledWith(
      APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
      '1234'
    );
  });

  it('renders companyNumberOfEmployees error text', () => {
    renderComponent({
      getErrorMessage: (fieldName) =>
        fieldName === APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES
          ? 'Number of employees is required'
          : undefined,
    });

    expect(
      screen.getByText('Number of employees is required')
    ).toBeInTheDocument();
  });

  it('renders companyBusinessBrief textarea with helper text', () => {
    renderComponent({
      formik: {
        ...baseFormik,
        values: {
          ...baseFormik.values,
          companyBusinessBrief: 'Business description',
        },
      } as FormikProps<Partial<Application>>,
    });

    expect(screen.getByLabelText('companyBusinessBrief.label')).toHaveValue(
      'Business description'
    );
    expect(
      screen.getByText(
        `${translationsBase}.fields.companyBusinessBrief.helperText`
      )
    ).toBeInTheDocument();
  });

  it('renders companyBusinessBrief error text', () => {
    renderComponent({
      getErrorMessage: (fieldName) =>
        fieldName === APPLICATION_FIELD_KEYS.COMPANY_BUSINESS_BRIEF
          ? 'Business brief is required'
          : undefined,
    });

    expect(screen.getByText('Business brief is required')).toBeInTheDocument();
  });

  it('renders business brief attachments list with current attachments', () => {
    renderComponent();

    const attachmentsList = screen.getByTestId('attachments-list');

    expect(attachmentsList).toHaveAttribute(
      'data-attachment-type',
      ATTACHMENT_TYPES.BUSINESS_BRIEF
    );
    expect(attachmentsList).toHaveAttribute('data-attachments-count', '1');
  });

  it('renders association business activity radios only for associations', () => {
    renderComponent({
      application: {
        ...baseApplication,
        company: {
          ...baseApplication.company,
          organizationType: ORGANIZATION_TYPES.ASSOCIATION,
        },
      } as Application,
    });

    expect(
      screen.getByText('associationHasBusinessActivities.label')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `${translationsBase}.fields.associationHasBusinessActivities.no`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `${translationsBase}.fields.associationHasBusinessActivities.yes`
      )
    ).toBeInTheDocument();
  });

  it('renders de minimis form and list when de minimis aid is selected', () => {
    renderComponent({
      showDeminimisSection: true,
      formik: {
        ...baseFormik,
        values: {
          ...baseFormik.values,
          deMinimisAid: true,
        },
      } as FormikProps<Partial<Application>>,
    });

    expect(screen.getByTestId('de-minimis-aid-form')).toBeInTheDocument();
    expect(screen.getByTestId('de-minimis-aids-list')).toBeInTheDocument();
  });
});
