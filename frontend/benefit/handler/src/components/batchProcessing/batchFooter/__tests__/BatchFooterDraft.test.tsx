import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import React from 'react';

import BatchFooterDraft from '../BatchFooterDraft';

jest.mock('benefit/handler/hooks/useBatchStatus', () => jest.fn());
jest.mock('benefit/handler/hooks/useDownloadBatchFiles', () => jest.fn());
jest.mock('benefit/handler/hooks/useRemoveAppFromBatch', () => jest.fn());

const mockUseBatchStatus = useBatchStatus as jest.MockedFunction<
  typeof useBatchStatus
>;
const mockUseDownloadBatchFiles = useDownloadBatchFiles as jest.MockedFunction<
  typeof useDownloadBatchFiles
>;
const mockUseRemoveAppFromBatch = useRemoveAppFromBatch as jest.MockedFunction<
  typeof useRemoveAppFromBatch
>;

const changeBatchStatus = jest.fn();
const downloadBatchFiles = jest.fn();
const removeApp = jest.fn();
const setBatchCloseAnimation = jest.fn();

const baseBatch: BatchProposal = {
  id: 'batch-1',
  status: BATCH_STATUSES.DRAFT,
  applications: [
    { id: 'app-1' },
    { id: 'app-2' },
  ] as BatchProposal['applications'],
  handler: {
    first_name: 'John',
    last_name: 'Doe',
  },
} as BatchProposal;

const renderSubject = (batchOverrides: Partial<BatchProposal> = {}): void => {
  renderComponent(
    <BatchFooterDraft
      batch={{ ...baseBatch, ...batchOverrides } as BatchProposal}
      setBatchCloseAnimation={setBatchCloseAnimation}
    />
  );
};

function DownloadStateWrapper(): React.ReactElement {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  mockUseDownloadBatchFiles.mockReturnValue({
    isError: error,
    isLoading: loading,
    mutate: downloadBatchFiles,
  } as never);

  return (
    <>
      <button type="button" onClick={() => setLoading(true)}>
        set-loading-true
      </button>
      <button type="button" onClick={() => setLoading(false)}>
        set-loading-false
      </button>
      <button type="button" onClick={() => setError(true)}>
        set-error-true
      </button>
      <BatchFooterDraft
        batch={
          {
            ...baseBatch,
            status: BATCH_STATUSES.AHJO_REPORT_CREATED,
          } as BatchProposal
        }
        setBatchCloseAnimation={setBatchCloseAnimation}
      />
    </>
  );
}

const renderDownloadStateSubject = (): void => {
  renderComponent(<DownloadStateWrapper />);
};

const clickDownloadButton = async (): Promise<void> => {
  await userEvent.click(screen.getByRole('button', { name: 'Lataa liitteet' }));
};

const setLoadingTrue = async (): Promise<void> => {
  await userEvent.click(
    screen.getByRole('button', { name: 'set-loading-true' })
  );
};

// UI Element Getters
const getMarkReadyButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Aloita Ahjo-valmistelu' });

const queryMarkReadyButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Aloita Ahjo-valmistelu' });

const getDeleteBatchButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Tyhjennä koonti' });

const getDownloadButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Lataa liitteet' });

const getMarkAsRegisteredButton = (): HTMLElement =>
  screen.getByRole('button', { name: /merkitse/i });

const getLoadingButton = (): HTMLElement =>
  screen.getByRole('button', { name: /ladataan/i });

const getConfirmOkButton = (): HTMLElement => screen.getByTestId('confirm-ok');

const getConfirmCancelButton = (): HTMLElement =>
  screen.getByTestId('confirm-cancel');

const getToggleButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: '' });

const getBatchRemovalConfirmText = (): HTMLElement =>
  screen.getByText('Oletko varma, että haluat tuhota koonnin?');

const getQueryBatchRemovalConfirmText = (): HTMLElement | null =>
  screen.queryByText('Oletko varma, että haluat tuhota koonnin?');

const getLockedBatchText = (): HTMLElement =>
  screen.getByText('Koonti lukittu');

const getMarkAsRegisteredModalHeading = (): HTMLElement =>
  screen.getByText(/merkitse koonti ahjoon viedyksi/i);

describe('BatchFooterDraft', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBatchStatus.mockReturnValue({
      mutate: changeBatchStatus,
    } as never);

    mockUseDownloadBatchFiles.mockReturnValue({
      isError: false,
      isLoading: false,
      mutate: downloadBatchFiles,
    } as never);

    mockUseRemoveAppFromBatch.mockReturnValue({
      mutate: removeApp,
    } as never);
  });

  it('renders mark as ready for Ahjo button when status is DRAFT', () => {
    renderSubject({ status: BATCH_STATUSES.DRAFT });
    expect(getMarkReadyButton()).toBeInTheDocument();
  });

  it('does not render mark as ready button when status is not DRAFT', () => {
    renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED });
    expect(queryMarkReadyButton()).not.toBeInTheDocument();
  });

  it('renders download files button when status is AHJO_REPORT_CREATED', () => {
    renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED });
    expect(getDownloadButton()).toBeInTheDocument();
  });

  it('does not render download button when status is DRAFT', () => {
    renderSubject({ status: BATCH_STATUSES.DRAFT });
    expect(
      screen.queryByRole('button', { name: 'Lataa liitteet' })
    ).not.toBeInTheDocument();
  });

  it('renders mark as registered to Ahjo button', () => {
    renderSubject();

    expect(
      screen.getByRole('button', { name: /merkitse/i })
    ).toBeInTheDocument();
  });

  it('renders toggle button when not in DRAFT status', () => {
    renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED });
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('does not render toggle button when status is DRAFT', () => {
    renderSubject({ status: BATCH_STATUSES.DRAFT });
    expect(
      screen.queryByRole('checkbox', { name: '' })
    ).not.toBeInTheDocument();
  });

  it('transitions from DRAFT to AHJO_REPORT_CREATED and triggers download', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.DRAFT })
    );

    // Mark as ready button directly changes status and downloads without modal
    await user.click(getMarkReadyButton());

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.AHJO_REPORT_CREATED,
    });

    expect(downloadBatchFiles).toHaveBeenCalledWith('batch-1');
  });

  it('opens batch removal confirmation modal and confirms removal', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getDeleteBatchButton());

    expect(getBatchRemovalConfirmText()).toBeInTheDocument();
    await user.click(getConfirmOkButton());

    expect(removeApp).toHaveBeenCalledWith({
      appIds: ['app-1', 'app-2'],
      batchId: 'batch-1',
    });
  });

  it('closes batch removal modal when cancelled', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getDeleteBatchButton());

    expect(getBatchRemovalConfirmText()).toBeInTheDocument();
    await user.click(getConfirmCancelButton());

    await waitFor(() => {
      expect(getQueryBatchRemovalConfirmText()).not.toBeInTheDocument();
    });
    expect(removeApp).not.toHaveBeenCalled();
  });

  it('opens mark as registered modal when button is clicked', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED })
    );

    await user.click(getMarkAsRegisteredButton());

    expect(getMarkAsRegisteredModalHeading()).toBeInTheDocument();
  });

  it('transitions to AWAITING_FOR_DECISION when mark as registered modal is submitted', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED })
    );

    await user.click(getMarkAsRegisteredButton());
    expect(getMarkAsRegisteredModalHeading()).toBeInTheDocument();

    await user.click(getConfirmOkButton());

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.AWAITING_FOR_DECISION,
    });
  });

  it('disables mark as registered button when status is DRAFT', () => {
    renderSubject({ status: BATCH_STATUSES.DRAFT });

    // In DRAFT status, the button should be disabled per component logic
    const buttons = screen.getAllByRole('button');
    const markRegisteredButton = buttons.find(
      (btn) =>
        btn.textContent?.includes('Merkitse') &&
        !btn.textContent?.includes('Aloita')
    );

    expect(markRegisteredButton).toBeDisabled();
  });

  it('transitions from AHJO_REPORT_CREATED back to DRAFT via toggle', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.AHJO_REPORT_CREATED })
    );

    const toggleButton = getToggleButton();
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggleButton as HTMLElement);

    expect(getLockedBatchText()).toBeInTheDocument();

    await user.click(getConfirmOkButton());

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.DRAFT,
    });
  });

  it('disables download and delete buttons when downloading attachments', async () => {
    renderDownloadStateSubject();

    await clickDownloadButton();
    expect(downloadBatchFiles).toHaveBeenCalledWith('batch-1');

    await setLoadingTrue();

    expect(getLoadingButton()).toBeDisabled();

    expect(getDeleteBatchButton()).toBeDisabled();
  });

  it('resets download loading state when download completes', async () => {
    const user = setupUserAndRender(() => renderDownloadStateSubject());

    await clickDownloadButton();
    await setLoadingTrue();

    expect(getLoadingButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'set-loading-false' }));

    await waitFor(() => {
      expect(getDownloadButton()).toBeEnabled();
    });
  });

  it('resets download loading state when download error occurs', async () => {
    const user = setupUserAndRender(() => renderDownloadStateSubject());

    await clickDownloadButton();
    await setLoadingTrue();

    expect(getLoadingButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'set-error-true' }));

    await waitFor(() => {
      expect(getDownloadButton()).toBeEnabled();
    });
  });

  it('handles empty applications array gracefully during batch removal', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ applications: [] as BatchProposal['applications'] })
    );

    await user.click(getDeleteBatchButton());

    expect(getBatchRemovalConfirmText()).toBeInTheDocument();

    await user.click(getConfirmOkButton());

    expect(removeApp).toHaveBeenCalledWith({
      appIds: [],
      batchId: 'batch-1',
    });
  });
});
