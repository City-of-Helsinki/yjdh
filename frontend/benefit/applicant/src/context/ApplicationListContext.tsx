import { ApplicationListItemData } from 'benefit-shared/types/application';
import React from 'react';

export type ApplicationListContextType = {
  count: number;
  list: Array<ApplicationListItemData>;
};

const ApplicationListContext = React.createContext<ApplicationListContextType>({
  count: 0,
  list: [],
});

export default ApplicationListContext;
