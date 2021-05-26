import * as React from 'react';
import Content from '../content/Content';
import Footer from '../footer/Footer';
import { StyledMain } from './styled';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props): JSX.Element => (
  <StyledMain>{children}</StyledMain>
);

export default Layout;
