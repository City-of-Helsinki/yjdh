import React from 'react';
import Application from 'shared/types/application';

export type ApplicationTableContextType = {
  applications: Application[];
  showOnlyMine: boolean;
  onToggleOnlyMine: () => void;
  selectedYear: string;
  onChangeYear: (year: string) => void;
  availableYears: string[];
  isLoading: boolean;
  error: unknown;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageCount: number;
};

export const ApplicationTableContext = React.createContext<
  ApplicationTableContextType | undefined
>(undefined);

export const useApplicationTable = (): ApplicationTableContextType => {
  const context = React.useContext(ApplicationTableContext);
  if (!context) {
    throw new Error(
      'useApplicationTable must be used within an ApplicationTable provider'
    );
  }
  return context;
};
