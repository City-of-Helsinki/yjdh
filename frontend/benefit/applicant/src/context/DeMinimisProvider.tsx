import { DeMinimisAid } from 'benefit-shared/types/application';
import React from 'react';

import DeMinimisContext from './DeMinimisContext';

const DeMinimisProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): React.ReactElement => {
  const [deMinimisAids, setDeMinimisAids] = React.useState<DeMinimisAid[]>([]);

  return (
    <DeMinimisContext.Provider
      value={{
        deMinimisAids,
        setDeMinimisAids,
      }}
    >
      {children}
    </DeMinimisContext.Provider>
  );
};

export default DeMinimisProvider;
