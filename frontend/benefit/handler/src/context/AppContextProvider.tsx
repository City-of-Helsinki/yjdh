import React from 'react';
import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [isFooterVisible, setIsFooterVisible] = React.useState<boolean>(false);
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [layoutBackgroundColor, setLayoutBackgroundColor] =
    React.useState<string>('');

  return (
    <AppContext.Provider
      value={{
        layoutBackgroundColor,
        isFooterVisible,
        isNavigationVisible,
        setIsNavigationVisible,
        setIsFooterVisible,
        setLayoutBackgroundColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
