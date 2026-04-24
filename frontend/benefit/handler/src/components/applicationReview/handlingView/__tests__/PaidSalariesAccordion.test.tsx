import { cleanup, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import useChangeEmployerAssurance from 'benefit/handler/hooks/useChangeEmployerAssurance';
import useInstalmentStatusTransitions from 'benefit/handler/hooks/useInstalmentStatusTransition';
import useRemoveAttachmentQuery from 'benefit/handler/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/handler/hooks/useUploadAttachmentQuery';
import {
  ATTACHMENT_TYPES,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import PaidSalariesAccordion from '../PaidSalariesAccordion';

jest.mock('benefit/handler/hooks/useChangeEmployerAssurance');
jest.mock('benefit/handler/hooks/useInstalmentStatusTransition');
jest.mock('benefit/handler/hooks/useRemoveAttachmentQuery');
jest.mock('benefit/handler/hooks/useUploadAttachmentQuery');

const mockUseChangeEmployerAssurance =
  useChangeEmployerAssurance as jest.MockedFunction<
    typeof useChangeEmployerAssurance
  >;
const mockUseInstalmentStatusTransitions =
  useInstalmentStatusTransitions as jest.MockedFunction<
    typeof useInstalmentStatusTransitions
  >;
const mockUseRemoveAttachmentQuery =
  useRemoveAttachmentQuery as jest.MockedFunction<
    typeof useRemoveAttachmentQuery
  >;
const mockUseUploadAttachmentQuery =
  useUploadAttachmentQuery as jest.MockedFunction<
    typeof useUploadAttachmentQuery
  >;

describe('PaidSalariesAccordion', () => {
  const mutateEmployerAssurance = jest.fn();
  const mutateInstalmentStatus = jest.fn();
  const mutateRemoveAttachment = jest.fn();
  const mutateUploadAttachment = jest.fn();

  const baseApplication = {
    id: 'application-id',
    employerAssurance: true,
    attachments: [
      {
        id: 'attachment-id',
        attachmentType: ATTACHMENT_TYPES.PAYSLIP,
        attachmentFile: '/files/payslip.pdf',
        attachmentFileName: 'payslip.pdf',
      },
    ],
    secondInstalment: {
      id: 'instalment-id',
      status: INSTALMENT_STATUSES.WAITING,
    },
  } as unknown as Application;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseChangeEmployerAssurance.mockReturnValue({
      mutate: mutateEmployerAssurance,
    } as never);

    mockUseInstalmentStatusTransitions.mockReturnValue({
      mutate: mutateInstalmentStatus,
    } as never);

    mockUseRemoveAttachmentQuery.mockReturnValue({
      mutate: mutateRemoveAttachment,
    } as never);

    mockUseUploadAttachmentQuery.mockReturnValue({
      mutate: mutateUploadAttachment,
    } as never);
  });

  const renderSubject = (
    data: Application = baseApplication
  ): ReturnType<typeof renderComponent> =>
    renderComponent(<PaidSalariesAccordion data={data} />);

  it('renders the employer assurance checkbox', () => {
    renderSubject();

    expect(
      screen.getByRole('checkbox', { name: /employer-assurance/i })
    ).toBeChecked();
  });

  it('syncs checkbox state from props', () => {
    renderSubject();

    expect(
      screen.getByRole('checkbox', { name: /employer-assurance-checkbox/i })
    ).toBeChecked();

    cleanup();

    renderSubject({ ...baseApplication, employerAssurance: false });

    expect(
      screen.getByRole('checkbox', { name: /employer-assurance-checkbox/i })
    ).not.toBeChecked();
  });

  it('calls employer assurance mutation when checkbox is toggled', () => {
    renderSubject();

    fireEvent.click(
      screen.getByRole('checkbox', { name: /employer-assurance/i })
    );

    expect(mutateEmployerAssurance).toHaveBeenCalledWith({
      id: 'application-id',
      employerAssurance: false,
    });
  });

  it('renders payslip attachment link', () => {
    renderSubject();

    expect(screen.getByRole('link', { name: 'payslip.pdf' })).toHaveAttribute(
      'href',
      '/files/payslip.pdf'
    );
  });

  it('calls remove attachment mutation when delete is clicked', () => {
    renderSubject();

    fireEvent.click(screen.getByRole('button', { name: /poista/i }));

    expect(mutateRemoveAttachment).toHaveBeenCalledWith({
      applicationId: 'application-id',
      attachmentId: 'attachment-id',
    });
  });

  it('renders instalment buttons and triggers status mutation', () => {
    renderSubject();

    fireEvent.click(screen.getByRole('button', { name: /kesken/i }));
    fireEvent.click(screen.getByRole('button', { name: /hyväksytty/i }));

    expect(mutateInstalmentStatus).toHaveBeenNthCalledWith(1, {
      id: 'instalment-id',
      status: INSTALMENT_STATUSES.PENDING,
    });
    expect(mutateInstalmentStatus).toHaveBeenNthCalledWith(2, {
      id: 'instalment-id',
      status: INSTALMENT_STATUSES.ACCEPTED,
    });
  });

  it('opens the file picker when upload button is clicked', () => {
    renderSubject();

    const fileInput = screen.getByTestId('paid-salaries-upload');
    const clickSpy = jest.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByRole('button', { name: /liitä tiedosto/i }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not call employer assurance mutation when application id is missing', () => {
    renderSubject({
      ...baseApplication,
      id: undefined,
    } as Application);

    fireEvent.click(
      screen.getByRole('checkbox', { name: /employer-assurance-checkbox/i })
    );

    expect(mutateEmployerAssurance).not.toHaveBeenCalled();
  });

  it('does not call upload mutation when no file is selected', () => {
    renderSubject();

    const fileInput = screen.getByTestId('paid-salaries-upload');

    fireEvent.change(fileInput, {
      target: { files: [] },
    });

    expect(mutateUploadAttachment).not.toHaveBeenCalled();
  });

  it('does not show instalment action buttons when second instalment is missing', () => {
    renderSubject({
      ...baseApplication,
      secondInstalment: undefined,
    } as Application);

    expect(
      screen.queryByRole('button', { name: /kesken/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /hyväksytty/i })
    ).not.toBeInTheDocument();
  });

  it('does not render delete button for non-payslip attachments', () => {
    renderSubject({
      ...baseApplication,
      attachments: [
        {
          id: 'attachment-id',
          attachmentType: ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT,
          attachmentFile: '/files/contract.pdf',
          attachmentFileName: 'contract.pdf',
        },
      ],
    } as Application);

    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  it('calls upload mutation when a file is selected', () => {
    renderSubject();

    const fileInput = screen.getByTestId('paid-salaries-upload');
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(mutateUploadAttachment).toHaveBeenCalledTimes(1);
    expect(mutateUploadAttachment).toHaveBeenCalledWith({
      applicationId: 'application-id',
      data: expect.any(FormData),
    });
  });

  it('does not render pending and accepted buttons for unsupported instalment status', () => {
    renderSubject({
      ...baseApplication,
      secondInstalment: {
        id: 'instalment-id',
        status: INSTALMENT_STATUSES.PAID,
      },
    } as Application);

    expect(
      screen.queryByRole('button', { name: /kesken/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /hyväksy/i })
    ).not.toBeInTheDocument();
  });

  it('does not call upload mutation when application id is missing', () => {
    renderSubject({
      ...baseApplication,
      id: undefined,
    } as Application);

    const fileInput = screen.getByTestId('paid-salaries-upload');
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(mutateUploadAttachment).not.toHaveBeenCalled();
  });

  it.each([
    INSTALMENT_STATUSES.WAITING,
    INSTALMENT_STATUSES.REQUESTED,
    INSTALMENT_STATUSES.RESPONDED,
  ])('renders instalment action buttons for %s status', (status) => {
    renderSubject({
      ...baseApplication,
      secondInstalment: {
        id: 'instalment-id',
        status,
      },
    } as Application);

    expect(screen.getByRole('button', { name: /kesken/i })).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /hyväksy/i })
    ).toBeInTheDocument();
  });
});
