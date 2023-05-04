import { BatchProposal } from 'benefit-shared/types/application';
import { LoadingSpinner } from 'hds-react';
import * as React from 'react';

import { $Empty } from '../applicationList/ApplicationList.sc';
import BatchApplicationList from './BatchApplicationList';
import { BatchListProps, useBatchProposal } from './useBatches';

const BatchProposals: React.FC = () => {
  const {
    t,
    batches,
    shouldShowSkeleton,
    shouldHideList,
    translationsBase,
  }: BatchListProps = useBatchProposal();
  const list = React.useMemo(() => batches, [batches]);

  if (shouldShowSkeleton) {
    return <LoadingSpinner small />;
  }

  return (
    <div data-testid="batch-application-list">
      {!shouldHideList ? (
        list.map((batch: BatchProposal) => (
          <BatchApplicationList batch={batch} key={batch.id} />
        ))
      ) : (
        <$Empty>{t(`${translationsBase}.messages.empty.handling`)}</$Empty>
      )}
    </div>
  );
};

export default BatchProposals;
