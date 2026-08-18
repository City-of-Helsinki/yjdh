import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
  TALPA_STATUSES,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import React from 'react';

import BatchApplicationList from '../BatchApplicationList';

jest.mock('benefit/handler/hooks/useRemoveAppFromBatch', () => jest.fn());

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string): string => key,
  }),
}));

jest.mock('shared/components/table/Table.sc', () => ({
  $Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }): JSX.Element => <a href={href}>{children}</a>,
}));

jest.mock(
  'shared/components/modal/Modal',
  () =>
    function MockModal({
      isOpen,
      customContent,
    }: {
      isOpen: boolean;
      customContent: React.ReactNode;
    }): JSX.Element | null {
      return isOpen ? <div data-testid="modal">{customContent}</div> : null;
    }
);

jest.mock(
  '../batchFooter/BatchFooterDraft',
  () =>
    function MockBatchFooterDraft(): JSX.Element {
      return <div data-testid="batch-footer-draft" />;
    }
);

jest.mock(
  '../batchFooter/BatchFooterInspection',
  () =>
    function MockBatchFooterInspection(): JSX.Element {
      return <div data-testid="batch-footer-inspection" />;
    }
);

jest.mock(
  '../batchFooter/BatchFooterCompletion',
  () =>
    function MockBatchFooterCompletion(): JSX.Element {
      return <div data-testid="batch-footer-completion" />;
    }
);

jest.mock(
  '../../applicationReview/actions/ConfirmModalContent/confirm',
  () =>
    function MockConfirmModalContent({
      onSubmit,
      onClose,
    }: {
      onSubmit: () => void;
      onClose: () => void;
    }): JSX.Element {
      return (
        <div>
          <button type="button" onClick={onSubmit}>
            confirm-modal-submit
          </button>
          <button type="button" onClick={onClose}>
            confirm-modal-close
          </button>
        </div>
      );
    }
);

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Table: ({
      rows,
      cols,
    }: {
      rows: Array<Record<string, unknown>>;
      cols: Array<{
        key: string;
        transform?: (row: Record<string, unknown>) => React.ReactNode;
      }>;
    }): JSX.Element => {
      const row = rows[0] || {};

      return (
        <div data-testid="batch-table">
          {cols.map((col) => (
            <div key={col.key} data-testid={`col-${col.key}`}>
              {col.transform ? col.transform(row) : String(row[col.key] ?? '')}
            </div>
          ))}
        </div>
      );
    },
  };
});

const removeMutate = jest.fn();

const mockUseRemoveAppFromBatch = useRemoveAppFromBatch as jest.MockedFunction<
  typeof useRemoveAppFromBatch
>;

const buildBatch = (
  status: BATCH_STATUSES,
  applicationsCount = 1
): BatchProposal =>
  ({
    id: 'batch-1',
    status,
    created_at: '2026-08-18T10:00:00Z',
    proposal_for_decision: PROPOSALS_FOR_DECISION.ACCEPTED,
    applications:
      applicationsCount > 0
        ? [
            {
              id: 'app-1',
              company_name: 'Company One',
              application_number: 111,
              employee_name: 'Employee One',
              business_id: '1234567-8',
              handled_at: '2026-08-18',
              talpa_status: TALPA_STATUSES.NOT_SENT_TO_TALPA,
              benefitAmount: 1200,
            },
          ]
        : [],
    handler: {
      first_name: 'Handler',
      last_name: 'User',
    },
  } as BatchProposal);

describe('BatchApplicationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRemoveAppFromBatch.mockReturnValue({
      mutate: removeMutate,
    } as never);
  });

  it('renders empty state when batch has no applications', () => {
    renderComponent(
      <BatchApplicationList batch={buildBatch(BATCH_STATUSES.DRAFT, 0)} />
    );

    expect(screen.queryByTestId('batch-table')).not.toBeInTheDocument();
  });

  it('renders table and draft footer when batch is in draft status', () => {
    renderComponent(
      <BatchApplicationList batch={buildBatch(BATCH_STATUSES.DRAFT)} />
    );

    expect(screen.getByTestId('batch-table')).toBeInTheDocument();
    expect(screen.getByTestId('batch-footer-draft')).toBeInTheDocument();
    expect(
      screen.queryByTestId('batch-footer-inspection')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('batch-footer-completion')
    ).not.toBeInTheDocument();
  });

  it('renders inspection footer when awaiting for decision', () => {
    renderComponent(
      <BatchApplicationList
        batch={buildBatch(BATCH_STATUSES.AWAITING_FOR_DECISION)}
      />
    );

    expect(screen.getByTestId('batch-table')).toBeInTheDocument();
    expect(screen.getByTestId('batch-footer-inspection')).toBeInTheDocument();
    expect(screen.queryByTestId('batch-footer-draft')).not.toBeInTheDocument();
  });

  it('renders completion footer and supports collapse toggle', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <BatchApplicationList
          batch={buildBatch(BATCH_STATUSES.DECIDED_ACCEPTED)}
        />
      )
    );

    expect(screen.getByTestId('batch-footer-completion')).toBeInTheDocument();

    const tableBody = screen.getByTestId('batch-table-body');
    expect(tableBody).toHaveAttribute('aria-hidden', 'true');

    await user.click(screen.getByTestId('toggle-batch-applications'));

    expect(tableBody).toHaveAttribute('aria-hidden', 'false');
  });

  it('renders rejected proposal status with count', () => {
    const batch = buildBatch(BATCH_STATUSES.DRAFT);
    batch.proposal_for_decision = PROPOSALS_FOR_DECISION.REJECTED;

    renderComponent(<BatchApplicationList batch={batch} />);

    expect(screen.getByTestId('batch-table')).toBeInTheDocument();
  });

  it('renders batch with multiple applications', () => {
    const batch = buildBatch(BATCH_STATUSES.DRAFT);
    batch.applications = [
      ...(batch.applications || []),
      {
        id: 'app-2',
        status: BATCH_STATUSES.DRAFT,
        company_name: 'Company Two',
        application_number: 222,
        employee_name: 'Employee Two',
        business_id: '2345678-9',
        handled_at: '2026-08-19',
        talpa_status: TALPA_STATUSES.SUCCESFULLY_SENT_TO_TALPA,
        benefitAmount: 1500,
      },
    ];

    renderComponent(<BatchApplicationList batch={batch} />);

    expect(screen.getByTestId('batch-table')).toBeInTheDocument();
  });

  it('renders sent to talpa status footer', () => {
    renderComponent(
      <BatchApplicationList batch={buildBatch(BATCH_STATUSES.SENT_TO_TALPA)} />
    );

    expect(screen.getByTestId('batch-footer-completion')).toBeInTheDocument();
  });

  it('renders rejected by talpa status footer', () => {
    renderComponent(
      <BatchApplicationList
        batch={buildBatch(BATCH_STATUSES.REJECTED_BY_TALPA)}
      />
    );

    expect(screen.getByTestId('batch-footer-completion')).toBeInTheDocument();
  });

  it('renders ahjo report created status with draft footer', () => {
    renderComponent(
      <BatchApplicationList
        batch={buildBatch(BATCH_STATUSES.AHJO_REPORT_CREATED)}
      />
    );

    expect(screen.getByTestId('batch-footer-draft')).toBeInTheDocument();
  });

  it('expands table by default for DRAFT status', () => {
    renderComponent(
      <BatchApplicationList batch={buildBatch(BATCH_STATUSES.DRAFT)} />
    );

    const tableBody = screen.getByTestId('batch-table-body');
    expect(tableBody).toHaveAttribute('aria-hidden', 'false');
  });

  it('expands table by default for AHJO_REPORT_CREATED status', () => {
    renderComponent(
      <BatchApplicationList
        batch={buildBatch(BATCH_STATUSES.AHJO_REPORT_CREATED)}
      />
    );

    const tableBody = screen.getByTestId('batch-table-body');
    expect(tableBody).toHaveAttribute('aria-hidden', 'false');
  });

  it('displays handler name correctly', () => {
    const batch = buildBatch(BATCH_STATUSES.DRAFT);
    batch.handler = { first_name: 'Jane', last_name: 'Smith' };

    renderComponent(<BatchApplicationList batch={batch} />);

    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('handles toggle button click for collapsed state', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <BatchApplicationList
          batch={buildBatch(BATCH_STATUSES.AWAITING_FOR_DECISION)}
        />
      )
    );

    const tableBody = screen.getByTestId('batch-table-body');
    const toggleButton = screen.getByTestId('toggle-batch-applications');

    expect(tableBody).toHaveAttribute('aria-hidden', 'true');

    await user.click(toggleButton);
    expect(tableBody).toHaveAttribute('aria-hidden', 'false');

    await user.click(toggleButton);
    expect(tableBody).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render toggle button when no applications', () => {
    renderComponent(
      <BatchApplicationList batch={buildBatch(BATCH_STATUSES.DRAFT, 0)} />
    );

    expect(
      screen.queryByTestId('toggle-batch-applications')
    ).not.toBeInTheDocument();
  });
});
