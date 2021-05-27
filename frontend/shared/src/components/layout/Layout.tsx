import * as React from 'react';

import { MAIN_CONTENT_ID } from '../../../constants';
import { StyledMain } from './styled';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props): JSX.Element => (
  <StyledMain id={MAIN_CONTENT_ID}>{children}</StyledMain>
);

export default Layout;
