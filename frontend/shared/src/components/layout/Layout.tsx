import * as React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';

import { $Main } from './Layout.sc';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => (
  <$Main id={MAIN_CONTENT_ID} data-testid={MAIN_CONTENT_ID}>
    {children}
  </$Main>
);

export default Layout;
