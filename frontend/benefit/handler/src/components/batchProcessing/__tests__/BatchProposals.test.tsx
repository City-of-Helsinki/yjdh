import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import i18n from 'i18next';
import React from 'react';

import BatchProposals from '../BatchProposals';
import { BatchListProps, useBatchProposal } from '../useBatches';

jest.mock('../useBatches', () => ({
  useBatchProposal: jest.fn(),
}));

jest.mock('../BatchApplicationList', () =>
  jest.fn(({ batch }) => (
    <div data-testid="batch-application-item">{batch.id}</div>
  ))
);

jest.mock('hds-react', () => ({
  LoadingSpinner: ({ small }: { small?: boolean }) => (
    <div data-testid="loading-spinner">{small ? 'small' : 'default'}</div>
  ),
}));

const mockUseBatchProposal = useBatchProposal as jest.MockedFunction<
  typeof useBatchProposal
>;

const baseHookState: BatchListProps = {
  t: i18n.t.bind(i18n),
  batches: [],
  shouldShowSkeleton: false,
  shouldHideList: false,
  getHeader: (id: string): string => id,
  translationsBase: 'common:applications.list',
};

const status = [BATCH_STATUSES.DRAFT];

const setHookState = (overrides: Partial<BatchListProps> = {}): void => {
  mockUseBatchProposal.mockReturnValue({
    ...baseHookState,
    ...overrides,
  });
};

const renderSubject = (setBatchCount = jest.fn()): jest.Mock => {
  renderComponent(
    <BatchProposals status={status} setBatchCount={setBatchCount} />
  );
  return setBatchCount;
};

describe('BatchProposals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHookState();
  });

  it('passes status to useBatchProposal and renders loading spinner when skeleton is shown', () => {
    setHookState({
      batches: [{ id: 'batch-1' }] as never,
      shouldShowSkeleton: true,
    });

    const setBatchCount = renderSubject();

    expect(mockUseBatchProposal).toHaveBeenCalledWith(status);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(setBatchCount).toHaveBeenLastCalledWith('(0)');
  });

  it('renders empty message when list should be hidden', () => {
    setHookState({
      batches: [],
      shouldHideList: true,
    });

    const setBatchCount = renderSubject();

    expect(screen.getByText('Ei yhtään koontia.')).toBeInTheDocument();
    expect(
      screen.queryByTestId('batch-application-item')
    ).not.toBeInTheDocument();
    expect(setBatchCount).toHaveBeenCalledWith('(0)');
  });

  it('renders all batch items and updates batch count from list length', () => {
    setHookState({
      batches: [{ id: 'batch-1' }, { id: 'batch-2' }] as never,
      shouldHideList: false,
    });

    const setBatchCount = renderSubject();

    expect(screen.getByTestId('batch-application-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('batch-application-item')).toHaveLength(2);
    expect(screen.getByText('batch-1')).toBeInTheDocument();
    expect(screen.getByText('batch-2')).toBeInTheDocument();
    expect(setBatchCount).toHaveBeenCalledWith('(2)');
  });
});
