import { screen, waitFor } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ApplicationFormStep5 from 'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5';
import { useApplicationFormStep5 } from 'benefit/applicant/components/applications/forms/application/step5/useApplicationFormStep5';
import useCloneApplicationMutation from 'benefit/applicant/hooks/useCloneApplicationMutation';
import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/forms/application/step5/useApplicationFormStep5'
);
jest.mock('benefit/applicant/hooks/useCloneApplicationMutation');

function CompanyInfoViewMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'company-info-view' });
}

function EmployeeViewMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'employee-view' });
}

function AttachmentsListViewMock({
  type,
}: {
  type: ATTACHMENT_TYPES;
}): React.ReactElement {
  return React.createElement('div', { 'data-testid': `attachment-${type}` });
}

function ConsentViewerMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'consent-viewer' });
}

function StepperActionsMock({
  handleSubmit,
  handleSave,
  handleBack,
  handleDelete,
}: {
  handleSubmit?: jest.Mock;
  handleSave?: jest.Mock;
  handleBack?: jest.Mock;
  handleDelete?: jest.Mock;
}): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'stepper-actions' },
    handleBack &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleBack },
        'Back'
      ),
    handleSave &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleSave },
        'Save'
      ),
    handleSubmit &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleSubmit },
        'Submit'
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
  'benefit/applicant/components/applications/forms/application/step5/companyInfoView/CompanyInfoView',
  () => CompanyInfoViewMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step5/employeeView/EmployeeView',
  () => EmployeeViewMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/step5/attachmentsListView/AttachmentsListView',
  () => AttachmentsListViewMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/consentViewer/ConsentViewer',
  () => ConsentViewerMock
);
jest.mock(
  'benefit/applicant/components/applications/forms/application/stepperActions/StepperActions',
  () => StepperActionsMock
);

const mockHookReturn = {
  t: i18n.t.bind(i18n),
  handleBack: jest.fn(),
  handleSave: jest.fn(),
  handleSubmit: jest.fn(),
  handleDelete: jest.fn(),
  handleStepChange: jest.fn(),
  handleClose: jest.fn(),
  translationsBase: 'common:applications.sections',
  isSubmit: false,
};

const mockCloneMutation = {
  data: undefined,
  isPending: false,
  mutate: jest.fn(),
};

const mockUseApplicationFormStep5 = useApplicationFormStep5 as jest.Mock;
const mockUseCloneApplicationMutation =
  useCloneApplicationMutation as jest.Mock;

const baseApplication = createMockApplication({
  id: 'app-123',
  status: APPLICATION_STATUSES.DRAFT,
  benefitType: BENEFIT_TYPES.EMPLOYMENT,
  attachments: [],
  applicantTermsApproval: undefined,
});

const renderForm = (
  data: Partial<Application> = baseApplication,
  props: { isReadOnly?: boolean } = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ApplicationFormStep5 data={data} {...props} />);

describe('ApplicationFormStep5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationFormStep5.mockReturnValue(mockHookReturn);
    mockUseCloneApplicationMutation.mockReturnValue(mockCloneMutation);
  });

  it('renders CompanyInfoView and EmployeeView', () => {
    renderForm();

    expect(screen.getByTestId('company-info-view')).toBeInTheDocument();
    expect(screen.getByTestId('employee-view')).toBeInTheDocument();
  });

  it('renders StepperActions when not read-only', () => {
    renderForm();

    expect(screen.getByTestId('stepper-actions')).toBeInTheDocument();
  });

  it('renders read-only action buttons and hides StepperActions', () => {
    renderForm(baseApplication, { isReadOnly: true });

    expect(screen.getByRole('button', { name: /sulje/i })).toBeInTheDocument();
    // Print button has role="link" in the component
    expect(screen.getByRole('link', { name: /tulosta/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /uuden hakemuksen pohjana/i })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('stepper-actions')).not.toBeInTheDocument();
  });

  it('shows employment attachment types when benefitType is EMPLOYMENT', () => {
    renderForm({
      ...baseApplication,
      benefitType: BENEFIT_TYPES.EMPLOYMENT,
    });

    expect(
      screen.getByTestId(`attachment-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`attachment-${ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`attachment-${ATTACHMENT_TYPES.EDUCATION_CONTRACT}`)
    ).toBeInTheDocument();
  });

  it('shows employment attachment types when benefitType is SALARY', () => {
    renderForm({
      ...baseApplication,
      benefitType: BENEFIT_TYPES.SALARY,
    });

    expect(
      screen.getByTestId(`attachment-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`)
    ).toBeInTheDocument();
  });

  it('shows commission attachment type when benefitType is COMMISSION', () => {
    renderForm({
      ...baseApplication,
      benefitType: BENEFIT_TYPES.COMMISSION,
    });

    expect(
      screen.getByTestId(`attachment-${ATTACHMENT_TYPES.COMMISSION_CONTRACT}`)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`attachment-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`)
    ).not.toBeInTheDocument();
  });

  it('does not show ConsentViewer when applicantTermsApproval is empty', () => {
    renderForm({ ...baseApplication, applicantTermsApproval: undefined });

    expect(screen.queryByTestId('consent-viewer')).not.toBeInTheDocument();
  });

  it('shows ConsentViewer when applicantTermsApproval is present', () => {
    renderForm({
      ...baseApplication,
      applicantTermsApproval: {
        id: 'terms-1',
      } as Application['applicantTermsApproval'],
    });

    expect(screen.getByTestId('consent-viewer')).toBeInTheDocument();
  });

  it('calls handleClose when close button is clicked in read-only mode', async () => {
    const handleClose = jest.fn();
    mockUseApplicationFormStep5.mockReturnValue({
      ...mockHookReturn,
      handleClose,
    });
    const user = setupUserAndRender(() => {
      renderForm(baseApplication, { isReadOnly: true });
    });

    await user.click(screen.getByRole('button', { name: /sulje/i }));

    expect(handleClose).toHaveBeenCalled();
  });

  it('calls cloneApplication with application id when clone button is clicked', async () => {
    const mutate = jest.fn();
    mockUseCloneApplicationMutation.mockReturnValue({
      ...mockCloneMutation,
      mutate,
    });
    const user = setupUserAndRender(() => {
      renderForm(baseApplication, { isReadOnly: true });
    });

    await user.click(
      screen.getByRole('link', { name: /uuden hakemuksen pohjana/i })
    );

    expect(mutate).toHaveBeenCalledWith('app-123');
  });

  it('redirects to cloned application path when clone mutation returns id', async () => {
    const push = jest.fn(() => Promise.resolve(true));
    mockUseCloneApplicationMutation.mockReturnValue({
      ...mockCloneMutation,
      data: { id: 'cloned-456' },
    });

    renderComponent(
      <ApplicationFormStep5 data={baseApplication} isReadOnly />,
      {
        locale: 'fi',
        asPath: '/application/app-123',
        push,
      }
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/application/cloned-456');
    });
  });

  it('opens print view in a new tab when print button is clicked', async () => {
    const openSpy = jest
      .spyOn(globalThis, 'open')
      .mockImplementation(() => null);
    const user = setupUserAndRender(() => {
      renderForm(baseApplication, { isReadOnly: true });
    });

    await user.click(screen.getByRole('link', { name: /tulosta/i }));

    expect(openSpy).toHaveBeenCalledWith(
      `${getBackendUrl(BackendEndpoint.APPLICANT_PRINT)}app-123/`,
      '_blank'
    );
  });

  it('shows clone button as loading when mutation is in progress', () => {
    mockUseCloneApplicationMutation.mockReturnValue({
      ...mockCloneMutation,
      isPending: true,
    });

    renderForm(baseApplication, { isReadOnly: true });

    const cloneButton = screen.getByRole('link', { name: /loading/i });
    expect(cloneButton).toBeInTheDocument();
    expect(cloneButton).toBeDisabled();
  });

  it('calls handleStepChange when attachment section edit button is clicked', async () => {
    const handleStepChange = jest.fn();
    mockUseApplicationFormStep5.mockReturnValue({
      ...mockHookReturn,
      handleStepChange,
    });
    const user = setupUserAndRender(() => {
      renderForm();
    });

    // The attachments section has an edit button that calls handleStepChange(3)
    const editButtons = screen.getAllByRole('button', {
      name: /edit|muokkaa/i,
    });
    await user.click(editButtons[0]);

    expect(handleStepChange).toHaveBeenCalledWith(3);
  });

  it('calls handleStepChange with step 4 when credentials section edit button is clicked', async () => {
    const handleStepChange = jest.fn();
    mockUseApplicationFormStep5.mockReturnValue({
      ...mockHookReturn,
      handleStepChange,
    });
    const user = setupUserAndRender(() => {
      renderForm();
    });

    const editButtons = screen.getAllByRole('button', {
      name: /edit|muokkaa/i,
    });
    await user.click(editButtons[1]);

    expect(handleStepChange).toHaveBeenCalledWith(4);
  });
});
