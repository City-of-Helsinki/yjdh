import * as React from 'react';
import { MAIN_CONTENT_ID } from '../../../constants';
import Content from '../content/Content';
import Footer from '../footer/Footer';
import { StyledMain } from './styled';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props): JSX.Element => (
  <StyledMain id={MAIN_CONTENT_ID}>{children}</StyledMain>
);

export default Layout;
