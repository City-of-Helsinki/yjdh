import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import React from 'react';
import { openFileInNewTab } from 'shared/utils/file.utils';

import i18n from '../../../../test/i18n/i18n-test';
import useApproveTermsOfServiceMutation from '../../../hooks/useApproveTermsOfServiceMutation';
import useLogout from '../../../hooks/useLogout';
import useTermsOfServiceData from '../../../hooks/useTermsOfServiceData';
import TermsOfService from '../TermsOfService';

jest.mock('../../../hooks/useApproveTermsOfServiceMutation');
jest.mock('../../../hooks/useLogout');
jest.mock('../../../hooks/useTermsOfServiceData');
jest.mock('shared/utils/file.utils', () => ({
  openFileInNewTab: jest.fn(),
}));
jest.mock(
  'react-markdown',
  () =>
    function MarkdownMock({
      children,
    }: {
      children?: React.ReactNode;
    }): React.ReactNode {
      return <div>{children}</div>;
    }
);

jest.mock(
  '../../pdfViewer/PdfViewer',
  () =>
    function PdfViewerMock(): React.ReactNode {
      return <div data-testid="pdf-viewer" />;
    }
);

const mockUseTermsOfServiceData = useTermsOfServiceData as jest.Mock;
const mockUseApproveTermsOfServiceMutation =
  useApproveTermsOfServiceMutation as jest.Mock;
const mockUseLogout = useLogout as jest.Mock;
const mockOpenFileInNewTab = openFileInNewTab as jest.Mock;

const t = i18n.t.bind(i18n);

const continueToServiceText = 'Jatka palveluun';
const pauseAndExitText = 'Keskeytä ja poistu';
const openTermsAsPdfText = 'Avaa ehdot PDF-tiedostona';
const serviceNameText = 'Helsinki-lisän asiointipalvelu';
const termsHeaderText =
  'Tietoa työnantajan edustajien henkilötietojen käsittelystä';

const setupTermsData = (overrides: Record<string, unknown> = {}): void => {
  mockUseTermsOfServiceData.mockReturnValue({
    theme: {
      spacingLayout: { l: '1rem' },
      spacing: { s: '0.5rem' },
    },
    t,
    termsInEffectUrl: '',
    termsInEffectMarkdown: '',
    user: { termsOfServiceApprovalNeeded: false },
    approveTermsOfService: jest.fn(),
    ...overrides,
  });
};

const renderTerms = (
  props: Partial<React.ComponentProps<typeof TermsOfService>> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(
    <TermsOfService setIsTermsOfServiceApproved={jest.fn()} {...props} />
  );

const getContinueToServiceButton = (): HTMLElement =>
  screen.getByRole('button', { name: continueToServiceText });

const getPauseAndExitButton = (): HTMLElement =>
  screen.getByRole('button', { name: pauseAndExitText });

const getOpenTermsAsPdfButton = (): HTMLElement =>
  screen.getByRole('button', { name: openTermsAsPdfText });

const clickContinueToService = async (
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  await user.click(getContinueToServiceButton());
};

describe('TermsOfService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApproveTermsOfServiceMutation.mockReturnValue({
      mutate: jest.fn(),
    });
    mockUseLogout.mockReturnValue(jest.fn());
    setupTermsData();
  });

  it('renders service and terms headings', () => {
    renderTerms();

    expect(
      screen.getByRole('heading', { name: serviceNameText, level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: termsHeaderText, level: 2 })
    ).toBeInTheDocument();
  });

  it('renders markdown terms when markdown exists', () => {
    setupTermsData({ termsInEffectMarkdown: '## Testiehdot' });

    renderTerms();

    expect(screen.getByText('## Testiehdot')).toBeInTheDocument();
  });

  it('renders pdf viewer and opens pdf in a new tab when open-as-pdf is clicked', async () => {
    setupTermsData({ termsInEffectUrl: 'https://example.com/terms.pdf' });
    const user = setupUserAndRender(() => {
      renderTerms();
    });

    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();

    await user.click(getOpenTermsAsPdfButton());

    expect(mockOpenFileInNewTab).toHaveBeenCalledWith(
      'https://example.com/terms.pdf'
    );
  });

  it('calls approveTermsOfService directly when approval is not needed', async () => {
    const approveTermsOfService = jest.fn();
    const mutate = jest.fn();
    setupTermsData({
      user: { termsOfServiceApprovalNeeded: false },
      approveTermsOfService,
    });
    mockUseApproveTermsOfServiceMutation.mockReturnValue({ mutate });

    const user = setupUserAndRender(() => {
      renderTerms();
    });

    await clickContinueToService(user);

    expect(approveTermsOfService).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('calls mutate with user and approves on success when approval is needed', async () => {
    const approveTermsOfService = jest.fn();
    const approvalUser = { id: 'user-1', termsOfServiceApprovalNeeded: true };
    const mutate = jest.fn(
      (_payload: unknown, options?: { onSuccess?: () => void }): void => {
        options?.onSuccess?.();
      }
    );

    setupTermsData({ user: approvalUser, approveTermsOfService });
    mockUseApproveTermsOfServiceMutation.mockReturnValue({ mutate });

    const user = setupUserAndRender(() => {
      renderTerms();
    });

    await clickContinueToService(user);

    expect(mutate).toHaveBeenCalledWith(approvalUser, {
      onSuccess: expect.any(Function),
    });
    expect(approveTermsOfService).toHaveBeenCalledTimes(1);
  });

  it('calls logout when pause and exit is clicked', async () => {
    const logout = jest.fn();
    mockUseLogout.mockReturnValue(logout);
    const user = setupUserAndRender(() => {
      renderTerms();
    });

    await user.click(getPauseAndExitButton());

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
