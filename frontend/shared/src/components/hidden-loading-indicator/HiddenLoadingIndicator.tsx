import { LoadingSpinner } from 'hds-react';
import React from 'react';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';

import { $HiddenLoadingIndicator } from './HiddenLoadingIndicator.sc';

const HiddenLoadingIndicator: React.FC = () => {
  const { isSyncing } = useIsSyncingToBackend();

  return isSyncing ? (
    <$HiddenLoadingIndicator>
      <LoadingSpinner data-testid="hidden-loading-indicator" />
    </$HiddenLoadingIndicator>
  ) : null;
};

export default HiddenLoadingIndicator;
