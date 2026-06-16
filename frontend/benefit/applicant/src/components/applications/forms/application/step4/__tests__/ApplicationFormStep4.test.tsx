import { screen } from '@testing-library/react';
import {
  createMockApplication,
  createMockBenefitAttachment,
} from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ApplicationFormStep4 from 'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4';
import { useApplicationFormStep4 } from 'benefit/applicant/components/applications/forms/application/step4/useApplicationFormStep4';
import { EMPLOYEE_CONSENT_FILE_PREFIX } from 'benefit/applicant/constants';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/forms/application/step4/useApplicationFormStep4'
);
jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));

const mockUseApplicationFormStep4 = useApplicationFormStep4 as jest.Mock;

const baseData = createMockApplication({
  id: 'app-1',
  status: APPLICATION_STATUSES.DRAFT,
  attachments: [],
});

const hookReturnBase = {
  t: i18n.t.bind(i18n),
  handleBack: jest.fn(),
  handleNext: jest.fn(),
  handleSave: jest.fn(),
  handleDelete: jest.fn(),
  handleRemoveAttachment: jest.fn(),
  handleUploadAttachment: jest.fn(),
  translationsBase: 'common:applications.sections.credentials.sections',
  attachment: undefined,
  isRemoving: false,
  isUploading: false,
};
const ingressHeading = hookReturnBase.t(
  'common:applications.sections.credentials.heading1'
);
const uploadPowerOfAttorneyPrintText = hookReturnBase.t(
  `${hookReturnBase.translationsBase}.uploadPowerOfAttorney.action1`
);
const uploadPowerOfAttorneyUploadText = hookReturnBase.t(
  `${hookReturnBase.translationsBase}.uploadPowerOfAttorney.action2`
);
const removeAttachmentText = hookReturnBase.t(
  'common:applications.sections.attachments.remove'
);
const employeeConsentAttachment = createMockBenefitAttachment({
  id: 'att-1',
  attachmentFileName: 'valtakirja.pdf',
  attachmentFile: '/files/valtakirja.pdf',
});

const renderStep4 = (
  data: Application = baseData
): ReturnType<typeof renderComponent> =>
  renderComponent(<ApplicationFormStep4 data={data} />);

const mockHookWithAttachment = (
  overrides: Partial<typeof hookReturnBase> = {}
): void => {
  mockUseApplicationFormStep4.mockReturnValue({
    ...hookReturnBase,
    attachment: employeeConsentAttachment,
    ...overrides,
  });
};

describe('ApplicationFormStep4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationFormStep4.mockReturnValue(hookReturnBase);
  });

  it('renders credentials ingress and stepper actions', () => {
    renderStep4();

    expect(screen.getByText(ingressHeading)).toBeInTheDocument();
    expect(screen.getByTestId('nextButton')).toBeInTheDocument();
  });

  it('shows upload controls when employee consent attachment is missing', () => {
    renderStep4();

    expect(screen.getByTestId('employee_consent')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: uploadPowerOfAttorneyUploadText,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /valtakirja\.pdf/i })
    ).not.toBeInTheDocument();
  });

  it('opens employee consent pdf when print button is clicked', async () => {
    const focus = jest.fn();
    const openSpy = jest
      .spyOn(globalThis, 'open')
      .mockReturnValue({ focus } as unknown as Window);
    const user = setupUserAndRender(() => {
      renderStep4();
    });

    await user.click(
      screen.getByRole('button', {
        name: uploadPowerOfAttorneyPrintText,
      })
    );

    expect(openSpy).toHaveBeenCalledWith(
      `/${EMPLOYEE_CONSENT_FILE_PREFIX}_fi.pdf`,
      '_blank'
    );
    expect(focus).toHaveBeenCalled();
  });

  it('opens attachment file and calls remove handler when attachment exists', async () => {
    const handleRemoveAttachment = jest.fn();
    const focus = jest.fn();
    const openSpy = jest
      .spyOn(globalThis, 'open')
      .mockReturnValue({ focus } as unknown as Window);
    mockHookWithAttachment({ handleRemoveAttachment });
    const user = setupUserAndRender(() => {
      renderStep4();
    });

    const attachmentLink = screen.getByRole('link', { name: 'valtakirja.pdf' });

    expect(attachmentLink).toBeInTheDocument();
    expect(screen.queryByTestId('employee_consent')).not.toBeInTheDocument();

    await user.click(attachmentLink);

    expect(openSpy).toHaveBeenCalledWith('/files/valtakirja.pdf', '_blank');
    expect(focus).toHaveBeenCalled();

    await user.click(
      screen.getByRole('link', {
        name: removeAttachmentText,
      })
    );

    expect(handleRemoveAttachment).toHaveBeenCalledWith('att-1');
  });

  it('does not call remove handler while removal is in progress', async () => {
    const handleRemoveAttachment = jest.fn();
    mockHookWithAttachment({ handleRemoveAttachment, isRemoving: true });
    const user = setupUserAndRender(() => {
      renderStep4();
    });

    await user.click(
      screen.getByRole('link', {
        name: removeAttachmentText,
      })
    );

    expect(handleRemoveAttachment).not.toHaveBeenCalled();
  });

  it.each([
    {
      expectedDisabled: true,
      attachments: [],
      testName:
        'disables next when employee consent attachment is missing from data',
    },
    {
      expectedDisabled: false,
      attachments: [
        createMockBenefitAttachment({
          attachmentType: ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
        }),
      ],
      testName: 'enables next when employee consent attachment exists in data',
    },
  ])('$testName', ({ attachments, expectedDisabled }) => {
    renderStep4({ ...baseData, attachments });

    const nextButton = screen.getByTestId('nextButton');

    if (expectedDisabled) {
      expect(nextButton).toBeDisabled();
    } else {
      expect(nextButton).toBeEnabled();
    }
  });
});
