import React from 'react';

import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [layoutBackgroundColor, setLayoutBackgroundColor] =
    React.useState<string>('');

  return (
    <AppContext.Provider
      value={{
        layoutBackgroundColor,
        isNavigationVisible,
        setIsNavigationVisible,
        setLayoutBackgroundColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
