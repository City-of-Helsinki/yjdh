import { DeMinimisAid } from 'benefit-shared/types/application';
import React from 'react';

import DeMinimisContext from './DeMinimisContext';

const DeMinimisProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [deMinimisAids, setDeMinimisAids] = React.useState<DeMinimisAid[]>([]);
  const [unfinishedDeMinimisAidRow, setUnfinishedDeMinimisAidRow] =
    React.useState<boolean>(false);
  return (
    <DeMinimisContext.Provider
      value={{
        deMinimisAids,
        setDeMinimisAids,
        unfinishedDeMinimisAidRow,
        setUnfinishedDeMinimisAidRow,
      }}
    >
      {children}
    </DeMinimisContext.Provider>
  );
};

export default DeMinimisProvider;
