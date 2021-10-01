import { DeMinimisAid } from 'benefit/applicant/types/application';
import noop from 'lodash/noop';
import React, { Dispatch, SetStateAction } from 'react';

export type DeMinimisContextType = {
  deMinimisAids: DeMinimisAid[];
  isLoading: boolean;
  setDeMinimisAids: Dispatch<SetStateAction<DeMinimisAid[]>>;
};

const DeMinimisContext = React.createContext<DeMinimisContextType>({
  deMinimisAids: [],
  isLoading: true,
  setDeMinimisAids: noop,
});

export default DeMinimisContext;
