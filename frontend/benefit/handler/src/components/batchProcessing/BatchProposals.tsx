import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { LoadingSpinner } from 'hds-react';
import * as React from 'react';

import { $EmptyHeading } from '../applicationList/ApplicationList.sc';
import BatchApplicationList from './BatchApplicationList';
import { BatchListProps, useBatchProposal } from './useBatches';

type BatchProps = {
  status: BATCH_STATUSES[];
  setBatchCount: React.Dispatch<React.SetStateAction<string>>;
};

const BatchProposals: React.FC<BatchProps> = ({
  status,
  setBatchCount,
}: BatchProps) => {
  const { t, batches, shouldShowSkeleton, shouldHideList }: BatchListProps =
    useBatchProposal(status);

  const list = React.useMemo(() => batches, [batches]);

  React.useEffect(() => {
    setBatchCount(`(${list.length})`);
    if (shouldShowSkeleton) {
      setBatchCount('(0)');
    }
  }, [list, setBatchCount, shouldShowSkeleton]);

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
        <$EmptyHeading>{t(`common:batches.empty`)}</$EmptyHeading>
      )}
    </div>
  );
};

export default BatchProposals;
