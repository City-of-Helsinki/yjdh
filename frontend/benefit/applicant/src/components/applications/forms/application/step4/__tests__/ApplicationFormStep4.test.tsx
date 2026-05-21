import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';
import { BenefitAttachment } from 'shared/types/attachment';

import ApplicationFormStep4 from '../ApplicationFormStep4';
import { useApplicationFormStep4 } from '../useApplicationFormStep4';

jest.mock('../useApplicationFormStep4', () => ({
  useApplicationFormStep4: jest.fn(),
}));

jest.mock(
  'benefit/applicant/components/credentialsIngress/CredentialsIngress',
  () =>
    function CredentialsIngress(): JSX.Element {
      return <div data-testid="credentials-ingress" />;
    }
);

jest.mock(
  '../credentialsSection/CredentialsSection',
  () =>
    function CredentialsSection({
      title,
      description,
      actions,
    }: {
      title: string;
      description: string;
      actions: React.ReactNode;
    }): JSX.Element {
      return (
        <section>
          <h2>{title}</h2>
          <p>{description}</p>
          {actions}
        </section>
      );
    }
);

jest.mock(
  'shared/components/attachments/AttachmentItem',
  () =>
    function AttachmentItem({
      id,
      name,
      removeText,
      onClick,
      onRemove,
    }: {
      id: string;
      name: string;
      removeText: string;
      onClick: () => void;
      onRemove: () => void;
    }): JSX.Element {
      return (
        <div data-testid={`attachment-item-${id}`}>
          <button type="button" onClick={onClick}>
            {name}
          </button>
          <button type="button" onClick={onRemove}>
            {removeText}
          </button>
        </div>
      );
    }
);

jest.mock(
  'shared/components/attachments/UploadAttachment',
  () =>
    function UploadAttachment({
      onUpload,
      uploadText,
    }: {
      onUpload: (attachment: FormData) => void;
      uploadText: string;
    }): JSX.Element {
      return (
        <button type="button" onClick={() => onUpload(new FormData())}>
          {uploadText}
        </button>
      );
    }
);

jest.mock(
  '../../stepperActions/StepperActions',
  () =>
    function StepperActions({
      disabledNext,
    }: {
      disabledNext?: boolean;
    }): JSX.Element {
      return (
        <button type="button" disabled={disabledNext}>
          Jatka
        </button>
      );
    }
);

const mockUseApplicationFormStep4 =
  useApplicationFormStep4 as jest.MockedFunction<
    typeof useApplicationFormStep4
  >;

const createEmployeeConsentAttachment = (
  id = 'employee-consent-attachment'
): BenefitAttachment => ({
  id,
  application: 'application-id',
  attachmentType: ATTACHMENT_TYPES.EMPLOYEE_CONSENT,
  attachmentFile: `/attachments/${id}.pdf`,
  attachmentFileName: `${id}.pdf`,
  contentType: 'application/pdf',
});

const setupUseApplicationFormStep4Mock = (): void => {
  mockUseApplicationFormStep4.mockImplementation(
    (application, onUploadAttachmentSuccess, onRemoveAttachmentSuccess) => ({
      t: (key: string) => key,
      handleNext: jest.fn(),
      handleSave: jest.fn(),
      handleBack: jest.fn(),
      handleDelete: jest.fn(),
      handleRemoveAttachment: jest.fn(() => {
        onRemoveAttachmentSuccess?.();
      }),
      handleUploadAttachment: jest.fn(() => {
        onUploadAttachmentSuccess?.(createEmployeeConsentAttachment());
      }),
      translationsBase: 'common:applications.sections.credentials.sections',
      attachment: application.attachments?.find(
        (attachment) =>
          attachment.attachmentType === ATTACHMENT_TYPES.EMPLOYEE_CONSENT
      ),
      isRemoving: false,
      isUploading: false,
    })
  );
};

const renderApplicationFormStep4 = (data: Partial<Application> = {}): void => {
  renderComponent(
    <ApplicationFormStep4
      data={
        {
          id: 'application-id',
          status: APPLICATION_STATUSES.DRAFT,
          attachments: [],
          ...data,
        } as Application
      }
    />
  );
};

describe('ApplicationFormStep4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseApplicationFormStep4Mock();
  });

  it('disables the next button when employee consent attachment is missing', () => {
    renderApplicationFormStep4();

    expect(screen.getByRole('button', { name: 'Jatka' })).toBeDisabled();
  });

  it('shows uploaded employee consent attachment and enables the next button', () => {
    renderApplicationFormStep4();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'common:applications.sections.credentials.sections.uploadPowerOfAttorney.action2',
      })
    );

    expect(
      screen.getByText('employee-consent-attachment.pdf')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();
  });

  it('initializes employee consent attachment from application data', () => {
    renderApplicationFormStep4({
      attachments: [createEmployeeConsentAttachment('existing-consent')],
    });

    expect(screen.getByText('existing-consent.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();
  });

  it('removes employee consent attachment from local state and disables the next button', () => {
    renderApplicationFormStep4({
      attachments: [createEmployeeConsentAttachment()],
    });

    expect(
      screen.getByText('employee-consent-attachment.pdf')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'common:applications.sections.attachments.remove',
      })
    );

    expect(
      screen.queryByText('employee-consent-attachment.pdf')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jatka' })).toBeDisabled();
  });
});
