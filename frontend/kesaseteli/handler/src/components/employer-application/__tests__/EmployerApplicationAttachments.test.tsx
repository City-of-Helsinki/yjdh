import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';

import EmployerApplicationAttachments from '../EmployerApplicationAttachments';
import { mockApplicationSingleVoucher, mockVoucher1 } from '../fixtures';

const mockOpenAttachment = jest.fn();
jest.mock('../../../hooks/backend/useOpenAttachment', () => ({
  __esModule: true,
  default: () => mockOpenAttachment,
}));

const mockMutate = jest.fn();
jest.mock('../../../hooks/backend/useUploadAttachmentQuery', () => ({
  __esModule: true,
  default: () => ({
    mutate: mockMutate,
    isLoading: false,
  }),
}));

const mockShowErrorToast = jest.fn();
jest.mock('shared/components/toast/show-error-toast', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockShowErrorToast(...args),
}));

describe('EmployerApplicationAttachments', () => {
  const fakeObjectFactory = new FakeObjectFactory();

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "no attachments" placeholder when empty', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              attachments: [],
            },
          ],
        }}
      />
    );
    expect(screen.getByText(/ei liitteitä/i)).toBeInTheDocument();
  });

  it('renders voucher attachments when present', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              attachments: [
                {
                  ...fakeObjectFactory.fakeAttachment('employment_contract'),
                  id: 'attachment-1',
                  attachment_file_name: 'sopimus.pdf',
                },
                {
                  ...fakeObjectFactory.fakeAttachment('payslip'),
                  id: 'attachment-2',
                  attachment_file_name: 'palkkakuitti.pdf',
                },
              ],
            },
          ],
        }}
      />
    );
    expect(screen.getByText('sopimus.pdf')).toBeInTheDocument();
    expect(screen.getByText('palkkakuitti.pdf')).toBeInTheDocument();
  });

  it('calls openAttachment when clicking an attachment name link', async () => {
    const attachment = {
      ...fakeObjectFactory.fakeAttachment('employment_contract'),
      id: 'attachment-1',
      attachment_file_name: 'sopimus.pdf',
    };

    renderComponent(
      <EmployerApplicationAttachments
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              attachments: [attachment],
            },
          ],
        }}
      />
    );

    const attachmentLink = screen.getByText('sopimus.pdf');
    expect(attachmentLink).toBeInTheDocument();

    await userEvent.click(attachmentLink);

    expect(mockOpenAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: attachment.id,
        attachment_file_name: attachment.attachment_file_name,
      })
    );
  });

  it('defaults to employment_contract radio button and lets user switch type', async () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    const contractRadio = screen.getByLabelText(/työsopimus/i);
    const payslipRadio = screen.getByLabelText(/palkkatodistus/i);

    expect(contractRadio).toBeChecked();
    expect(payslipRadio).not.toBeChecked();

    await userEvent.click(payslipRadio);

    expect(contractRadio).not.toBeChecked();
    expect(payslipRadio).toBeChecked();
  });

  it('shows error toast for invalid file types', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    // Select input element
    const fileInput = screen.getByLabelText(/tai valitse tiedosto/i);
    const invalidFile = new File(['dummy content'], 'document.txt', {
      type: 'text/plain',
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'error.attachments.title',
      'error.attachments.fileType'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows error toast for files that exceed maximum size limit', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    const fileInput = screen.getByLabelText(/tai valitse tiedosto/i);
    const hugeFile = new File(['dummy content'], 'sopimus.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(hugeFile, 'size', { value: 20 * 1024 * 1024 }); // 20 MB

    fireEvent.change(fileInput, { target: { files: [hugeFile] } });

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      'error.attachments.title',
      'error.attachments.tooBig'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('uploads attachment with current type when file is chosen via file picker', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    const fileInput = screen.getByLabelText(/tai valitse tiedosto/i);
    const validFile = new File(['dummy content'], 'sopimus.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        summer_voucher: mockApplicationSingleVoucher.summer_vouchers[0].id,
        applicationId: mockApplicationSingleVoucher.id,
        data: expect.any(FormData),
      })
    );

    const formDataCalled = mockMutate.mock.calls[0][0].data as FormData;
    expect(formDataCalled.get('attachment_type')).toBe('employment_contract');
    expect(formDataCalled.get('attachment_file')).toEqual(validFile);
  });

  it('uploads attachment when file is dropped on the drag & drop area', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    const dragDropArea = screen.getByLabelText(
      /raahaa ja pudota uudet liitteet tähän/i
    );
    const validFile = new File(['dummy content'], 'palkka.jpeg', {
      type: 'image/jpeg',
    });

    fireEvent.drop(dragDropArea, {
      dataTransfer: {
        files: [validFile],
      },
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        summer_voucher: mockApplicationSingleVoucher.summer_vouchers[0].id,
        applicationId: mockApplicationSingleVoucher.id,
        data: expect.any(FormData),
      })
    );

    const formDataCalled = mockMutate.mock.calls[0][0].data as FormData;
    expect(formDataCalled.get('attachment_file')).toEqual(validFile);
  });

  it('hides drag-and-drop area on mobile while file upload button remains', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: /\(max-width:/.test(query),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    renderComponent(
      <EmployerApplicationAttachments
        application={mockApplicationSingleVoucher}
      />
    );

    expect(
      screen.queryByLabelText(/raahaa ja pudota/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /valitse tiedosto/i })
    ).toBeInTheDocument();
  });
});
