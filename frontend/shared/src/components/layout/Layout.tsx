import * as React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';

import { StyledMain } from './styled';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => (
  <StyledMain id={MAIN_CONTENT_ID}>{children}</StyledMain>
);

export default Layout;
