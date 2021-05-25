import * as React from 'react';
import Content from '../content/Content';
import Footer from '../footer/Footer';
import Header from '../header/Header';
import { StyledMain } from './styled';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props): JSX.Element => (
  <StyledMain>
    <Header />
    <Content>{children}</Content>
    <Footer />
  </StyledMain>
);

export default Layout;
