import { DeMinimisAid } from 'benefit-shared/types/application';
import noop from 'lodash/noop';
import React, { Dispatch, SetStateAction } from 'react';

export type DeMinimisContextType = {
  deMinimisAids: DeMinimisAid[];
  setDeMinimisAids: Dispatch<SetStateAction<DeMinimisAid[]>>;
  unfinishedDeMinimisAidRow: boolean;
  setUnfinishedDeMinimisAidRow: Dispatch<SetStateAction<boolean>>;
};

const DeMinimisContext = React.createContext<DeMinimisContextType>({
  deMinimisAids: [],
  setDeMinimisAids: noop,
  unfinishedDeMinimisAidRow: false,
  setUnfinishedDeMinimisAidRow: noop,
});

export default DeMinimisContext;
