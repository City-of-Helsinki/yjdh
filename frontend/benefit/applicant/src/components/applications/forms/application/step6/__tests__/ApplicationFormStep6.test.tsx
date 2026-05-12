import { screen } from '@testing-library/react';
import {
  createMockApplicantConsent,
  createMockApplication,
} from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ApplicationFormStep6 from 'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6';
import { useApplicationFormStep6 } from 'benefit/applicant/components/applications/forms/application/step6/useApplicationFormStep6';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import React from 'react';
import { openFileInNewTab } from 'shared/utils/file.utils';

jest.mock(
  'benefit/applicant/components/applications/forms/application/step6/useApplicationFormStep6'
);
jest.mock('shared/utils/file.utils', () => ({
  openFileInNewTab: jest.fn(),
}));

function PdfViewerMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'pdf-viewer' });
}

function MarkdownMock({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'terms-markdown' },
    children
  );
}

jest.mock(
  'benefit/applicant/components/pdfViewer/PdfViewer',
  () => PdfViewerMock
);
jest.mock('benefit/applicant/components/termsOfService/TermsOfService', () => ({
  $Markdown: MarkdownMock,
}));

const mockUseApplicationFormStep6 = useApplicationFormStep6 as jest.Mock;
const mockOpenFileInNewTab = openFileInNewTab as jest.Mock;

const baseApplication = createMockApplication({
  id: 'app-123',
  status: APPLICATION_STATUSES.DRAFT,
  applicantTermsInEffect: {
    id: 'terms-1',
    effectiveFrom: '2026-01-01',
    termsType: ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
    applicantConsents: [
      createMockApplicantConsent({
        id: 'consent-1',
        textFi: 'Consent one',
      }),
      createMockApplicantConsent({
        id: 'consent-2',
        textFi: 'Consent two',
      }),
    ],
  },
});

const mockHookReturn = {
  t: (key: string): string => key,
  handleSubmit: jest.fn(),
  handleSave: jest.fn(),
  handleBack: jest.fn(),
  handleDelete: jest.fn(),
  handleClick: jest.fn(),
  getErrorText: jest.fn(() => ''),
  cbPrefix: 'application_consent',
  textLocale: 'Fi',
  applicantTermsInEffectUrl: 'https://example.com/terms.pdf',
  applicantTermsInEffectMd: '# Terms markdown',
  checkedArray: [false, true],
};

const renderForm = (): ReturnType<typeof renderComponent> =>
  renderComponent(
    <ApplicationFormStep6
      data={baseApplication}
      setIsSubmittedApplication={jest.fn()}
      setIsResubmission={jest.fn()}
    />
  );

describe('ApplicationFormStep6', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationFormStep6.mockReturnValue(mockHookReturn);
  });

  it('renders terms content and consent checkboxes', () => {
    renderForm();

    expect(screen.getByText('# Terms markdown')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    expect(screen.getAllByTestId('application-terms-consent')).toHaveLength(2);
  });

  it('opens terms PDF in new tab when open-as-pdf button is clicked', async () => {
    const user = setupUserAndRender(() => {
      renderForm();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'common:applications.actions.openTermsAsPDF',
      })
    );

    expect(mockOpenFileInNewTab).toHaveBeenCalledWith(
      'https://example.com/terms.pdf'
    );
  });

  it('calls handleClick with checkbox index when consent is clicked', async () => {
    const handleClick = jest.fn();
    mockUseApplicationFormStep6.mockReturnValue({
      ...mockHookReturn,
      handleClick,
    });
    const user = setupUserAndRender(() => {
      renderForm();
    });

    const checkboxes = screen.getAllByTestId('application-terms-consent');
    await user.click(checkboxes[0]);

    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('disables next button when some consents are unchecked', () => {
    renderForm();

    expect(screen.getByTestId('nextButton')).toBeDisabled();
  });

  it('enables next button when all consents are checked', () => {
    mockUseApplicationFormStep6.mockReturnValue({
      ...mockHookReturn,
      checkedArray: [true, true],
    });

    renderForm();

    expect(screen.getByTestId('nextButton')).toBeEnabled();
  });

  it('calls handleSubmit when StepperActions submit is clicked', async () => {
    const handleSubmit = jest.fn();
    mockUseApplicationFormStep6.mockReturnValue({
      ...mockHookReturn,
      handleSubmit,
      checkedArray: [true, true],
    });
    const user = setupUserAndRender(() => {
      renderForm();
    });

    await user.click(screen.getByTestId('nextButton'));

    expect(handleSubmit).toHaveBeenCalled();
  });
});
