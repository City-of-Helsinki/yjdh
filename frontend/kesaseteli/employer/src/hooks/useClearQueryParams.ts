import * as React from 'react';
import { clearQueryParams } from 'shared/utils/query.utils';

const useClearQueryParams = (): void => {
  React.useEffect(() => clearQueryParams());
};

export default useClearQueryParams;
