import React from 'react';

import { HandledAplication } from '../types/application';
import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [isSidebarVisible, setIsSidebarVisible] =
    React.useState<boolean>(false);
  const [isFooterVisible, setIsFooterVisible] = React.useState<boolean>(false);
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [layoutBackgroundColor, setLayoutBackgroundColor] =
    React.useState<string>('');
  const [handledApplication, setHandledApplication] =
    React.useState<HandledAplication | null>(null);

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
