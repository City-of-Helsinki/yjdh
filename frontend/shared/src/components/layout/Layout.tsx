import * as React from 'react';

import { $Main } from './Layout.sc';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => <$Main>{children}</$Main>;

export default Layout;
