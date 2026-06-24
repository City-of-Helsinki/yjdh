import React from 'react';

import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): React.ReactElement => {
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] =
    React.useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        isNavigationVisible,
        isSidebarVisible,
        setIsNavigationVisible,
        setIsSidebarVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
