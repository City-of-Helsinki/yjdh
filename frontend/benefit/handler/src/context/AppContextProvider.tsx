import React from 'react';

import { HandledAplication } from '../types/application';
import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): React.ReactElement => {
  const [isSidebarVisible, setIsSidebarVisible] =
    React.useState<boolean>(false);
  const [isFooterVisible, setIsFooterVisible] = React.useState<boolean>(false);
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [layoutBackgroundColor, setLayoutBackgroundColor] =
    React.useState<string>('');
  const [handledApplication, setHandledApplication] =
    React.useState<HandledAplication | null>(null);

  const contextValue = React.useMemo(
    () => ({
      layoutBackgroundColor,
      isFooterVisible,
      isNavigationVisible,
      handledApplication,
      setHandledApplication,
      setIsNavigationVisible,
      setIsFooterVisible,
      setLayoutBackgroundColor,
      isSidebarVisible,
      setIsSidebarVisible,
    }),
    [
      layoutBackgroundColor,
      isFooterVisible,
      isNavigationVisible,
      handledApplication,
      isSidebarVisible,
      setHandledApplication,
      setIsNavigationVisible,
      setIsFooterVisible,
      setLayoutBackgroundColor,
      setIsSidebarVisible,
    ]
  );
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
