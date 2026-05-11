import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadP2PFile from 'benefit/handler/hooks/useDownloadP2PFile';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import React from 'react';

import BatchFooterCompletion from '../BatchFooterCompletion';

jest.mock('benefit/handler/hooks/useBatchStatus', () => jest.fn());
jest.mock('benefit/handler/hooks/useDownloadP2PFile', () => jest.fn());
jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): JSX.Element {
      return <div data-testid="loading-skeleton" />;
    }
);

const mockUseBatchStatus = useBatchStatus as jest.MockedFunction<
  typeof useBatchStatus
>;
const mockUseDownloadP2PFile = useDownloadP2PFile as jest.MockedFunction<
  typeof useDownloadP2PFile
>;

const changeBatchStatus = jest.fn();
const downloadP2PFile = jest.fn();
const setBatchCloseAnimation = jest.fn();

const baseBatch: BatchProposal = {
  id: 'batch-1',
  status: BATCH_STATUSES.SENT_TO_TALPA,
  p2p_checker_name: 'Checker Name',
  p2p_inspector_email: 'inspector@example.com',
  p2p_inspector_name: 'Inspector Name',
  decision_maker_name: 'Decision Maker',
  decision_maker_title: 'Chief Officer',
  decision_date: '2026-05-01',
  expert_inspector_name: '',
  expert_inspector_title: '',
  section_of_the_law: '123',
} as BatchProposal;

const downloadButtonText = 'Lataa Talpa-tiedosto';

const renderSubject = (batchOverrides: Partial<BatchProposal> = {}): void => {
  renderComponent(
    <BatchFooterCompletion
      batch={{ ...baseBatch, ...batchOverrides } as BatchProposal}
      setBatchCloseAnimation={setBatchCloseAnimation}
    />
  );
};

function DownloadStateWrapper(): JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  mockUseDownloadP2PFile.mockReturnValue({
    isError: error,
    isLoading: loading,
    mutate: downloadP2PFile,
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
      <BatchFooterCompletion
        batch={baseBatch}
        setBatchCloseAnimation={setBatchCloseAnimation}
      />
    </>
  );
}

const renderDownloadStateSubject = (): void => {
  renderComponent(<DownloadStateWrapper />);
};

const clickDownloadButton = async (): Promise<void> => {
  await userEvent.click(
    screen.getByRole('button', { name: downloadButtonText })
  );
};

const setLoadingTrue = async (): Promise<void> => {
  await userEvent.click(
    screen.getByRole('button', { name: 'set-loading-true' })
  );
};

describe('BatchFooterCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBatchStatus.mockReturnValue({
      mutate: changeBatchStatus,
    } as never);

    mockUseDownloadP2PFile.mockReturnValue({
      isError: false,
      isLoading: false,
      mutate: downloadP2PFile,
    } as never);
  });

  it('renders decision details and p2p inspector fields by default', () => {
    renderSubject();

    expect(screen.getByText('Päätöksen tiedot')).toBeInTheDocument();
    expect(screen.getByText('Päättäjän nimi')).toBeInTheDocument();
    expect(screen.getByText('Decision Maker')).toBeInTheDocument();
    expect(screen.getByText('Tarkastajan nimi, P2P')).toBeInTheDocument();
    expect(screen.getByText('Inspector Name')).toBeInTheDocument();
    expect(screen.getByText('Lataa Talpa-tiedosto')).toBeInTheDocument();
  });

  it('renders expert inspector fields when expert inspector values exist', () => {
    renderSubject({
      expert_inspector_name: 'Expert Name',
      expert_inspector_title: 'Expert Title',
    });

    expect(screen.getByText('Asiantarkistajan nimi, Ahjo')).toBeInTheDocument();
    expect(screen.getByText('Expert Name')).toBeInTheDocument();
    expect(
      screen.getByText('Asiantarkistajan titteli, Ahjo')
    ).toBeInTheDocument();
    expect(screen.getByText('Expert Title')).toBeInTheDocument();
    expect(screen.queryByText('Tarkastajan nimi, P2P')).not.toBeInTheDocument();
  });

  it('opens archive modal from SENT_TO_TALPA and submits completed status', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.SENT_TO_TALPA })
    );

    await user.click(screen.getByRole('button', { name: 'Arkistoi' }));

    expect(screen.getByText('Arkistoi koonti')).toBeInTheDocument();
    expect(
      screen.getByText('Haluatko merkitä koonnin valmiiksi ja arkistoida sen?')
    ).toBeInTheDocument();

    await user.click(screen.getAllByTestId('confirm-ok')[0]);

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.COMPLETED,
    });
  });

  it('submits completed status from completion-to-archive confirm action', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.SENT_TO_TALPA })
    );

    await user.click(screen.getByRole('button', { name: 'Arkistoi' }));

    expect(screen.getByText('Arkistoi koonti')).toBeInTheDocument();

    // Component currently renders two completion modals under same state flag.
    // Click the second confirm to cover this specific submit branch.
    await user.click(screen.getAllByTestId('confirm-ok')[1]);

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.COMPLETED,
    });
  });

  it('opens return-to-inspection modal from DECIDED_ACCEPTED and submits awaiting status', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({ status: BATCH_STATUSES.DECIDED_ACCEPTED })
    );

    await user.click(
      screen.getByRole('button', { name: 'Palauta odottamaan maksuun vientiä' })
    );

    expect(
      screen.getByText('Palauta koonti odottamaan maksuun vientiä')
    ).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-ok'));

    expect(changeBatchStatus).toHaveBeenCalledWith({
      id: 'batch-1',
      status: BATCH_STATUSES.AWAITING_FOR_DECISION,
    });
  });

  it('downloads p2p file and toggles loading state from hook flags', async () => {
    const user = setupUserAndRender(() => renderDownloadStateSubject());

    await clickDownloadButton();
    expect(downloadP2PFile).toHaveBeenCalledWith('batch-1');

    await setLoadingTrue();

    expect(screen.getByRole('button', { name: /ladataan/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'set-loading-false' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: downloadButtonText })
      ).toBeEnabled();
    });
  });

  it('resets download loading state when download error occurs', async () => {
    const user = setupUserAndRender(() => renderDownloadStateSubject());

    await clickDownloadButton();
    expect(downloadP2PFile).toHaveBeenCalledWith('batch-1');

    await setLoadingTrue();
    expect(screen.getByRole('button', { name: /ladataan/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'set-error-true' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: downloadButtonText })
      ).toBeEnabled();
    });
  });
});
