import { DeMinimisAid } from 'benefit-shared/types/application';
import noop from 'lodash/noop';
import React, { Dispatch, SetStateAction } from 'react';

export type DeMinimisContextType = {
  deMinimisAids: DeMinimisAid[];
  setDeMinimisAids: Dispatch<SetStateAction<DeMinimisAid[]>>;
};

const DeMinimisContext = React.createContext<DeMinimisContextType>({
  deMinimisAids: [],
  setDeMinimisAids: noop,
});

export default DeMinimisContext;
