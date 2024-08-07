import * as React from 'react';

import AppContext from '../context/AppContext';
import { $Main } from './Layout.sc';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children, ...rest }) => {
  const { isSidebarVisible } = React.useContext(AppContext);

  return (
    <$Main {...rest} isSidebarVisible={isSidebarVisible}>
      {children}
    </$Main>
  );
};

export default Layout;
