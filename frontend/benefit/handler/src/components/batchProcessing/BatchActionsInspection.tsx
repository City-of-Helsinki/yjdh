import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import React from 'react';

import BatchActionsCompletion from './BatchActionsCompletion';
import BatchActionsInspectionForm from './BatchActionsInspectionForm';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation?: React.Dispatch<React.SetStateAction<boolean>>;
};

const BatchActionsInspection: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: BatchProps) =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  {
    const { status } = batch;
    const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

    return (
      <>
        {[BATCH_STATUSES.AWAITING_FOR_DECISION].includes(status) ? (
          <BatchActionsInspectionForm
            batch={batch}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            setBatchCloseAnimation={setBatchCloseAnimation}
          />
        ) : null}
        {[BATCH_STATUSES.DECIDED_ACCEPTED].includes(status) ? (
          <BatchActionsCompletion
            batch={batch}
            setBatchCloseAnimation={setBatchCloseAnimation}
          />
        ) : null}
      </>
    );
  };

export default BatchActionsInspection;
