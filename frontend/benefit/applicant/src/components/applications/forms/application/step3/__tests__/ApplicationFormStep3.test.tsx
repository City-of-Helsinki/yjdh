import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';
import { BenefitAttachment } from 'shared/types/attachment';

import ApplicationFormStep3 from '../ApplicationFormStep3';
import { useApplicationFormStep3 } from '../useApplicationFormStep3';

const mockUseApplicationFormStep3 =
  useApplicationFormStep3 as jest.MockedFunction<
    typeof useApplicationFormStep3
  >;

const createAttachment = (
  id: string,
  attachmentType: ATTACHMENT_TYPES
): BenefitAttachment => ({
  id,
  application: 'application-id',
  attachmentType,
  attachmentFile: `/attachments/${id}.pdf`,
  attachmentFileName: `${id}.pdf`,
  contentType: 'application/pdf',
});

jest.mock(
  '../attachmentsList/AttachmentsList',
  () =>
    function AttachmentsList({
      attachmentType,
      attachments,
      onUploadSuccess,
      onRemoveSuccess,
    }: {
      attachmentType: ATTACHMENT_TYPES;
      attachments?: BenefitAttachment[];
      onUploadSuccess?: (attachment: BenefitAttachment) => void;
      onRemoveSuccess?: (attachmentId: string) => void;
    }): JSX.Element {
      const attachmentCount =
        attachments?.filter(
          (attachment) => attachment.attachmentType === attachmentType
        ).length ?? 0;

      return (
        <li data-testid={`attachments-list-${attachmentType}`}>
          <span data-testid={`attachment-count-${attachmentType}`}>
            {attachmentCount}
          </span>
          <button
            type="button"
            onClick={() =>
              onUploadSuccess?.(
                createAttachment(`uploaded-${attachmentType}`, attachmentType)
              )
            }
          >
            Upload {attachmentType}
          </button>
          <button
            type="button"
            onClick={() => onRemoveSuccess?.(`uploaded-${attachmentType}`)}
          >
            Remove {attachmentType}
          </button>
        </li>
      );
    }
);

jest.mock('../useApplicationFormStep3', () => ({
  useApplicationFormStep3: jest.fn(),
}));

jest.mock(
  'benefit/applicant/components/attachmentsIngress/AttachmentsIngress',
  () =>
    function AttachmentsIngress(): JSX.Element {
      return <div data-testid="attachments-ingress" />;
    }
);

jest.mock(
  '../attachmentsList/AttachmentsList',
  () =>
    function AttachmentsList({
      attachmentType,
      attachments,
      onUploadSuccess,
      onRemoveSuccess,
    }: {
      attachmentType: ATTACHMENT_TYPES;
      attachments?: BenefitAttachment[];
      onUploadSuccess?: (attachment: BenefitAttachment) => void;
      onRemoveSuccess?: (attachmentId: string) => void;
    }): JSX.Element {
      const attachmentCount =
        attachments?.filter(
          (attachment) => attachment.attachmentType === attachmentType
        ).length ?? 0;

      return (
        <li data-testid={`attachments-list-${attachmentType}`}>
          <span data-testid={`attachment-count-${attachmentType}`}>
            {attachmentCount}
          </span>
          <button
            type="button"
            onClick={() =>
              onUploadSuccess?.(
                createAttachment(`uploaded-${attachmentType}`, attachmentType)
              )
            }
          >
            Upload {attachmentType}
          </button>
          <button
            type="button"
            onClick={() => onRemoveSuccess?.(`uploaded-${attachmentType}`)}
          >
            Remove {attachmentType}
          </button>
        </li>
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

const hasRequiredEmploymentContract = (application: Application): boolean =>
  Boolean(
    application.attachments?.some(
      (attachment) =>
        attachment.attachmentType === ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT
    )
  );

const setupUseApplicationFormStep3Mock = (): void => {
  mockUseApplicationFormStep3.mockImplementation((application) => ({
    handleBack: jest.fn(),
    handleNext: jest.fn(),
    handleSave: jest.fn(),
    handleDelete: jest.fn(),
    benefitType: application.benefitType,
    apprenticeshipProgram: Boolean(application.apprenticeshipProgram),
    showSubsidyMessage: false,
    attachments: application.attachments ?? [],
    hasRequiredAttachments: hasRequiredEmploymentContract(application),
    paySubsidyGranted: application.paySubsidyGranted,
  }));
};

const renderApplicationFormStep3 = (data: Partial<Application> = {}): void => {
  renderComponent(
    <ApplicationFormStep3
      data={
        {
          id: 'application-id',
          status: APPLICATION_STATUSES.DRAFT,
          benefitType: BENEFIT_TYPES.SALARY,
          apprenticeshipProgram: false,
          attachments: [],
          ...data,
        } as Application
      }
    />
  );
};

describe('ApplicationFormStep3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseApplicationFormStep3Mock();
  });

  it('enables the next button after a required attachment is uploaded', () => {
    renderApplicationFormStep3();

    expect(screen.getByRole('button', { name: 'Jatka' })).toBeDisabled();

    fireEvent.click(
      screen.getByRole('button', {
        name: `Upload ${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`,
      })
    );

    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();
  });

  it('passes uploaded attachments to all attachment lists', () => {
    renderApplicationFormStep3();

    expect(
      screen.getByTestId(
        `attachment-count-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`
      )
    ).toHaveTextContent('0');

    fireEvent.click(
      screen.getByRole('button', {
        name: `Upload ${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`,
      })
    );

    expect(
      screen.getByTestId(
        `attachment-count-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`
      )
    ).toHaveTextContent('1');
  });

  it('disables the next button again after a required attachment is removed', () => {
    renderApplicationFormStep3();

    fireEvent.click(
      screen.getByRole('button', {
        name: `Upload ${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`,
      })
    );

    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();

    fireEvent.click(
      screen.getByRole('button', {
        name: `Remove ${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`,
      })
    );

    expect(screen.getByRole('button', { name: 'Jatka' })).toBeDisabled();
  });

  it('initializes local attachments from the application data', () => {
    renderApplicationFormStep3({
      attachments: [
        createAttachment(
          'existing-employment-contract',
          ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT
        ),
      ],
    });

    expect(
      screen.getByTestId(
        `attachment-count-${ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}`
      )
    ).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Jatka' })).toBeEnabled();
  });
});
