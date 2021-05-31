import * as React from 'react';
import styled from 'styled-components';

const Heading = styled.h1`
  font-size: 2rem;
  line-height: 2.4rem;
  margin: 0 0 1rem;
`;

const Main = styled.main`
  padding: 1rem;
`;

type Props = { children: React.ReactNode; headingText: string };

const Layout = ({ children, headingText }: Props): JSX.Element => (
  <Main id="main_content">
    <Heading>{headingText}</Heading>
    {children}
  </Main>
);

export default Layout;
