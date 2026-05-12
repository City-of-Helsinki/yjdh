import { RenderResult, screen, within } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1';
import { useApplicationFormStep1 } from 'benefit/applicant/components/applications/forms/application/step1/useApplicationFormStep1';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/forms/application/step1/useApplicationFormStep1'
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/deMinimisAid/list/useDeminimisAidsList',
  () => ({
    useDeminimisAidsList: jest.fn(() => ({
      deMinimisTotal: jest.fn(() => 0),
    })),
  })
);
jest.mock('benefit/applicant/hooks/useAlertBeforeLeaving');
jest.mock('benefit/applicant/hooks/useDependentFieldsEffect');

function CompanyInfoMock(): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'company-info' },
    'Company Info'
  );
}

function DeMinimisAidFormMock(): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'de-minimis-aid-form' },
    'De Minimis Form'
  );
}

function DeMinimisAidsListMock(): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'de-minimis-aids-list' },
    'De Minimis List'
  );
}

function StepperActionsMock({
  handleSubmit,
  handleSave,
  handleDelete,
}: {
  handleSubmit: jest.Mock;
  handleSave?: jest.Mock;
  handleDelete?: jest.Mock;
}): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'stepper-actions' },
    React.createElement(
      'button',
      { type: 'button', onClick: handleSubmit },
      'Submit'
    ),
    handleSave &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleSave },
        'Save'
      ),
    handleDelete &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleDelete },
        'Delete'
      )
  );
}

jest.mock(
  'benefit/applicant/components/applications/forms/application/step1/companyInfo/CompanyInfo',
  () => CompanyInfoMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/deMinimisAid/DeMinimisAidForm',
  () => DeMinimisAidFormMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/deMinimisAid/list/DeMinimisAidsList',
  () => DeMinimisAidsListMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/stepperActions/StepperActions',
  () => StepperActionsMock
);

const mockHookReturn = {
  t: i18n.t.bind(i18n),
  handleSubmit: jest.fn(),
  handleSave: jest.fn(),
  handleDelete: jest.fn(),
  getErrorMessage: jest.fn(),
  clearDeminimisAids: jest.fn(),
  getDefaultLanguage: jest.fn(() => ({ label: 'Finnish', value: 'fi' })),
  showDeminimisSection: true,
  languageOptions: [
    { label: 'Finnish', value: 'fi' },
    { label: 'Swedish', value: 'sv' },
    { label: 'English', value: 'en' },
  ],
  fields: {
    companyContactPersonFirstName: {
      name: 'companyContactPersonFirstName',
      label: 'First Name',
      placeholder: 'John',
    },
    companyContactPersonLastName: {
      name: 'companyContactPersonLastName',
      label: 'Last Name',
      placeholder: 'Doe',
    },
    companyContactPersonPhoneNumber: {
      name: 'companyContactPersonPhoneNumber',
      label: 'Phone',
      placeholder: '+358...',
    },
    companyContactPersonEmail: {
      name: 'companyContactPersonEmail',
      label: 'Email',
      placeholder: 'john@example.com',
    },
    applicantLanguage: {
      name: 'applicantLanguage',
      label: 'Asiointikieli',
      placeholder: 'Select language',
    },
    deMinimisAid: {
      name: 'deMinimisAid',
      label: 'De Minimis Aid',
      placeholder: '',
    },
    deMinimisAidSet: {
      name: 'deMinimisAidSet',
      label: 'Aid Set',
      placeholder: '',
    },
    coOperationNegotiations: {
      name: 'coOperationNegotiations',
      label: 'Cooperation Negotiations',
      placeholder: '',
    },
    coOperationNegotiationsDescription: {
      name: 'coOperationNegotiationsDescription',
      label: 'Description',
      placeholder: 'Describe...',
    },
    associationHasBusinessActivities: {
      name: 'associationHasBusinessActivities',
      label: 'Has Activities',
      placeholder: '',
    },
  },
  translationsBase: 'applications.form.step1',
  formik: {
    values: {
      companyContactPersonFirstName: 'John',
      companyContactPersonLastName: 'Doe',
      companyContactPersonPhoneNumber: '0501234567',
      companyContactPersonEmail: 'john@example.com',
      applicantLanguage: 'fi',
      deMinimisAid: null,
      deMinimisAidSet: [],
      coOperationNegotiations: false,
      coOperationNegotiationsDescription: '',
      associationHasBusinessActivities: true,
    },
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    setFieldValue: jest.fn(),
    dirty: false,
    touched: {},
    errors: {},
    isValid: true,
    isSubmitting: false,
  },
  deMinimisAidSet: [],
};

const baseApplication = createMockApplication({
  id: 'app-123',
  status: APPLICATION_STATUSES.DRAFT,
});

const renderForm = (
  data: Partial<Application> = baseApplication
): RenderResult =>
  renderComponent(<ApplicationFormStep1 data={data} />).renderResult;

const getErrorByField = (fieldName: string): string | undefined =>
  fieldName === 'companyContactPersonFirstName'
    ? 'First name is required'
    : undefined;

const mockUseApplicationFormStep1 = useApplicationFormStep1 as jest.Mock;

describe('ApplicationFormStep1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationFormStep1.mockReturnValue(mockHookReturn);
  });

  it('renders the form with all sections', () => {
    renderForm();

    expect(screen.getByTestId('company-info')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByTestId('stepper-actions')).toBeInTheDocument();
  });

  it('shows de minimis section when enabled', () => {
    renderForm();

    expect(
      screen.getByRole('group', { name: /de minimis aid/i })
    ).toBeInTheDocument();
  });

  it('hides de minimis section when disabled', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      showDeminimisSection: false,
    });

    renderForm();

    expect(screen.queryByTestId('de-minimis-aid-form')).not.toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    const { formik } = mockHookReturn;
    const user = setupUserAndRender(() => {
      renderForm();
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, 'Jane');

    expect(formik.handleChange).toHaveBeenCalled();
  });

  it('displays error messages for invalid fields', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      getErrorMessage: jest.fn(getErrorByField),
    });

    renderForm();

    expect(screen.getByText('First name is required')).toBeInTheDocument();
  });

  it('calls handleSubmit when submit button is clicked', async () => {
    const handleSubmit = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      handleSubmit,
    });
    const user = setupUserAndRender(() => {
      renderForm();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
  });

  it('shows save button when form is valid and no incomplete de minimis aid', () => {
    const handleSave = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      handleSave,
    });

    renderForm();

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('shows delete button for existing applications', () => {
    const handleDelete = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      handleDelete,
    });

    renderForm({ ...baseApplication, id: 'app-123' });

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('hides delete button for new applications', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      handleDelete: undefined,
    });

    renderForm({ ...baseApplication, id: undefined });

    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  it('shows cooperation description field when negotiations are enabled', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        values: {
          ...mockHookReturn.formik.values,
          coOperationNegotiations: true,
        },
      },
    });

    renderForm();

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('hides cooperation description field when negotiations are disabled', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        values: {
          ...mockHookReturn.formik.values,
          coOperationNegotiations: false,
        },
      },
    });

    renderForm();

    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
  });

  it('displays de minimis form and list when de minimis aid is selected', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        values: {
          ...mockHookReturn.formik.values,
          deMinimisAid: true,
        },
      },
    });

    renderForm();

    expect(screen.getByTestId('de-minimis-aid-form')).toBeInTheDocument();
    expect(screen.getByTestId('de-minimis-aids-list')).toBeInTheDocument();
  });

  it('hides de minimis form and list when de minimis aid is not selected', () => {
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        values: {
          ...mockHookReturn.formik.values,
          deMinimisAid: false,
        },
      },
    });

    renderForm();

    expect(screen.queryByTestId('de-minimis-aid-form')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('de-minimis-aids-list')
    ).not.toBeInTheDocument();
  });

  it('clears de minimis aids and sets deMinimisAid to false when "No" is selected', async () => {
    const setFieldValue = jest.fn();
    const setDeMinimisAids = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        setFieldValue,
        values: { ...mockHookReturn.formik.values, deMinimisAid: true },
      },
    });

    const user = setupUserAndRender(() => {
      renderComponent(
        <DeMinimisContext.Provider
          value={{ deMinimisAids: [], setDeMinimisAids }}
        >
          <ApplicationFormStep1 data={baseApplication} />
        </DeMinimisContext.Provider>
      );
    });

    const deMinimisGroup = screen.getByRole('group', {
      name: /de minimis aid/i,
    });
    await user.click(within(deMinimisGroup).getAllByRole('radio')[0]);

    expect(setFieldValue).toHaveBeenCalledWith('deMinimisAid', false);
    expect(setFieldValue).toHaveBeenCalledWith('deMinimisAidSet', []);
    expect(setDeMinimisAids).toHaveBeenCalledWith([]);
  });

  it('sets deMinimisAid to true when "Yes" is selected', async () => {
    const setFieldValue = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        setFieldValue,
        values: { ...mockHookReturn.formik.values, deMinimisAid: false },
      },
    });

    const user = setupUserAndRender(() => {
      renderForm();
    });

    const deMinimisGroup = screen.getByRole('group', {
      name: /de minimis aid/i,
    });
    await user.click(within(deMinimisGroup).getAllByRole('radio')[1]);

    expect(setFieldValue).toHaveBeenCalledWith('deMinimisAid', true);
  });

  it('sets coOperationNegotiations to false when "No" is selected', async () => {
    const setFieldValue = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        setFieldValue,
        values: {
          ...mockHookReturn.formik.values,
          coOperationNegotiations: true,
        },
      },
    });

    const user = setupUserAndRender(() => {
      renderForm();
    });

    const coOpGroup = screen.getAllByRole('group')[1];
    await user.click(within(coOpGroup).getAllByRole('radio')[0]);

    expect(setFieldValue).toHaveBeenCalledWith(
      'coOperationNegotiations',
      false
    );
  });

  it('sets coOperationNegotiations to true when "Yes" is selected', async () => {
    const setFieldValue = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: {
        ...mockHookReturn.formik,
        setFieldValue,
        values: {
          ...mockHookReturn.formik.values,
          coOperationNegotiations: false,
        },
      },
    });

    const user = setupUserAndRender(() => {
      renderForm();
    });

    const coOpGroup = screen.getAllByRole('group')[1];
    await user.click(within(coOpGroup).getAllByRole('radio')[1]);

    expect(setFieldValue).toHaveBeenCalledWith('coOperationNegotiations', true);
  });

  it('calls setFieldValue with selected language value when language is changed', async () => {
    const setFieldValue = jest.fn();
    mockUseApplicationFormStep1.mockReturnValue({
      ...mockHookReturn,
      formik: { ...mockHookReturn.formik, setFieldValue },
    });

    const user = setupUserAndRender(() => {
      renderForm();
    });

    await user.click(screen.getByLabelText(/asiointikieli/i));
    await user.click(screen.getByRole('option', { name: /swedish/i }));

    expect(setFieldValue).toHaveBeenCalledWith('applicantLanguage', 'sv');
  });
});
