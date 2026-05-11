import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ROUTES } from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useChangeEmployerAssuranceMutation from 'benefit/applicant/hooks/useChangeEmployerAssuranceMutation';
import useSecondInstalmentInfoQuery from 'benefit/applicant/hooks/useSecondInstalmentInfoQuery';
import useSecondInstalmentRespondMutation from 'benefit/applicant/hooks/useSecondInstalmentRespondMutation';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import React from 'react';
import showSuccessToast from 'shared/components/toast/show-success-toast';

import SecondInstalmentUploadPage from '../SecondInstalmentUploadPage';

const replaceMock = jest.fn();
const secondInstalmentRespondMock = jest.fn();
const changeEmployerAssuranceMock = jest.fn();

jest.mock('shared/components/forms/fields/Fields.sc', () => ({
  $Checkbox: ({
    checked,
    disabled,
    id,
    label,
    name,
    onChange,
    required,
  }: {
    checked?: boolean;
    disabled?: boolean;
    id?: string;
    label: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
  }) => (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={onChange}
      />
    </label>
  ),
}));
jest.mock('benefit/applicant/hooks/useApplicationQuery');
jest.mock('benefit/applicant/hooks/useChangeEmployerAssuranceMutation');
jest.mock('benefit/applicant/hooks/useSecondInstalmentInfoQuery');
jest.mock('benefit/applicant/hooks/useSecondInstalmentRespondMutation');
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());
jest.mock('shared/components/toast/show-success-toast', () => jest.fn());

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {
      id: 'application-id',
    },
    replace: replaceMock,
  }),
}));

jest.mock(
  'benefit/applicant/components/applications/forms/application/step3/attachmentsList/AttachmentsList',
  () =>
    ({
      attachmentType,
      attachments,
      required,
    }: {
      attachmentType: string;
      attachments?: Array<{
        attachmentType: string;
        attachmentFileName?: string;
      }>;
      required?: boolean;
    }) => {
      const files =
        attachments?.filter(
          (attachment) => attachment.attachmentType === attachmentType
        ) ?? [];

      return (
        <li data-testid={`attachment-list-${attachmentType}`}>
          <h2>
            {attachmentType}
            {required ? ' *' : ''}
          </h2>
          {files.map((file) => (
            <span key={file.attachmentFileName}>{file.attachmentFileName}</span>
          ))}
        </li>
      );
    }
);

jest.mock('hds-react', () => ({
  ...jest.requireActual('hds-react'),
  IconArrowRight: () => <svg data-testid="arrow-right-icon" />,
  LoadingSpinner: ({ small }: { small?: boolean }) => (
    <span data-testid={small ? 'small-loading-spinner' : 'loading-spinner'} />
  ),
}));

const mockedUseApplicationQuery = useApplicationQuery as jest.MockedFunction<
  typeof useApplicationQuery
>;

const mockedUseChangeEmployerAssuranceMutation =
  useChangeEmployerAssuranceMutation as jest.MockedFunction<
    typeof useChangeEmployerAssuranceMutation
  >;

const mockedUseSecondInstalmentInfoQuery =
  useSecondInstalmentInfoQuery as jest.MockedFunction<
    typeof useSecondInstalmentInfoQuery
  >;

const mockedUseSecondInstalmentRespondMutation =
  useSecondInstalmentRespondMutation as jest.MockedFunction<
    typeof useSecondInstalmentRespondMutation
  >;

const mockedShowSuccessToast = showSuccessToast as jest.MockedFunction<
  typeof showSuccessToast
>;

const payslipAttachment = {
  id: 'payslip-id',
  application: 'application-id',
  attachmentType: ATTACHMENT_TYPES.PAYSLIP,
  attachmentFile: '/media/payslip.pdf',
  attachmentFileName: 'payslip.pdf',
  contentType: 'application/pdf',
};

const otherAttachment = {
  id: 'other-id',
  application: 'application-id',
  attachmentType: ATTACHMENT_TYPES.OTHER_ATTACHMENT,
  attachmentFile: '/media/other.pdf',
  attachmentFileName: 'other.pdf',
  contentType: 'application/pdf',
};

const secondInstalmentInfo = {
  amount: 1234,
  start_date: '2026-01-01',
  end_date: '2026-06-30',
  employee_first_name: 'Test',
  employee_last_name: 'Employee',
  submitted_at: '2026-01-02T10:15:00Z',
  application_number: '123456',
};

const setupMocks = ({
  attachments = [payslipAttachment],
  employerAssurance = true,
  info = secondInstalmentInfo,
  infoIsError = false,
  infoIsLoading = false,
  respondIsLoading = false,
  changeEmployerAssuranceIsLoading = false,
}: {
  attachments?: typeof payslipAttachment[];
  employerAssurance?: boolean;
  info?: typeof secondInstalmentInfo;
  infoIsError?: boolean;
  infoIsLoading?: boolean;
  respondIsLoading?: boolean;
  changeEmployerAssuranceIsLoading?: boolean;
} = {}): void => {
  mockedUseApplicationQuery.mockReturnValue({
    data: {
      attachments,
      employer_assurance: employerAssurance,
    },
  } as ReturnType<typeof useApplicationQuery>);

  mockedUseSecondInstalmentInfoQuery.mockReturnValue({
    data: info,
    isError: infoIsError,
    isLoading: infoIsLoading,
  } as ReturnType<typeof useSecondInstalmentInfoQuery>);

  mockedUseSecondInstalmentRespondMutation.mockReturnValue({
    mutate: secondInstalmentRespondMock,
    isLoading: respondIsLoading,
  } as unknown as ReturnType<typeof useSecondInstalmentRespondMutation>);

  mockedUseChangeEmployerAssuranceMutation.mockReturnValue({
    mutate: changeEmployerAssuranceMock,
    isLoading: changeEmployerAssuranceIsLoading,
  } as unknown as ReturnType<typeof useChangeEmployerAssuranceMutation>);
};

const renderPage = (): ReturnType<typeof renderComponent> =>
  renderComponent(<SecondInstalmentUploadPage />);

describe('SecondInstalmentUploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders page heading', () => {
    renderPage();

    expect(
      screen.getByRole('heading', {
        name: 'common:applications.secondInstalmentUpload.heading',
      })
    ).toBeInTheDocument();
  });

  it('renders employee name and application number', () => {
    renderPage();

    expect(screen.getByText(/Test\s+Employee/)).toBeInTheDocument();
    expect(screen.getByText(/123456/)).toBeInTheDocument();
  });

  it('renders second instalment amount and date range', () => {
    renderPage();

    expect(
      screen.getByText((_content, element) => {
        if (element?.tagName.toLowerCase() !== 'p') {
          return false;
        }

        const text = element.textContent?.replace(/\u00A0/g, ' ') ?? '';

        return (
          text.includes(
            'common:applications.secondInstalmentUpload.instalmentInfo1'
          ) &&
          text.includes('1 234') &&
          text.includes(
            'common:applications.secondInstalmentUpload.instalmentInfo2'
          ) &&
          text.includes('1.1.2026') &&
          text.includes('30.6.2026')
        );
      })
    ).toBeInTheDocument();
  });

  it('renders loading spinner when second instalment info is loading', () => {
    setupMocks({
      infoIsLoading: true,
    });

    renderPage();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error message when second instalment info query fails', () => {
    setupMocks({
      infoIsError: true,
    });

    renderPage();

    expect(
      screen.getByText(
        'common:applications.secondInstalmentUpload.secondInstalmentInfoError'
      )
    ).toBeInTheDocument();
  });

  it('renders attachment file names in correct attachment areas', () => {
    setupMocks({
      attachments: [payslipAttachment, otherAttachment],
    });

    renderPage();

    expect(screen.getByText('payslip.pdf')).toBeInTheDocument();
    expect(screen.getByText('other.pdf')).toBeInTheDocument();
  });

  it('disables Lähetä button if there are no files in the Palkkakuitti attachment component', () => {
    setupMocks({
      attachments: [otherAttachment],
    });

    renderPage();

    expect(
      screen.getByRole('button', {
        name: 'common:applications.secondInstalmentUpload.buttons.submit',
      })
    ).toBeDisabled();

    expect(secondInstalmentRespondMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('submits second instalment response and navigates to application view when payslip exists', () => {
    secondInstalmentRespondMock.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    renderPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'common:applications.secondInstalmentUpload.buttons.submit',
      })
    );

    expect(secondInstalmentRespondMock).toHaveBeenCalledWith(
      { applicationId: 'application-id' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
    expect(mockedShowSuccessToast).toHaveBeenCalledWith(
      'common:applications.secondInstalmentUpload.successTitle',
      [
        'common:applications.secondInstalmentUpload.successMessage1',
        '123456',
        'common:applications.secondInstalmentUpload.successMessage2',
      ].join(' ')
    );
    expect(replaceMock).toHaveBeenCalledWith(`${ROUTES.HOME}`);
  });

  it('renders employer assurance checkbox checked when employer assurance exists on application', () => {
    setupMocks({
      employerAssurance: true,
    });

    renderPage();

    expect(
      screen.getByRole('checkbox', {
        name: 'common:applications.secondInstalmentUpload.employerAssurance *',
      })
    ).toBeChecked();
  });

  it('calls backend when employer assurance checkbox value is changed', () => {
    setupMocks({
      employerAssurance: false,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'common:applications.secondInstalmentUpload.employerAssurance *',
      })
    );

    expect(changeEmployerAssuranceMock).toHaveBeenCalledWith({
      applicationId: 'application-id',
      employerAssurance: true,
    });
  });
});
