import AppContext from 'benefit/handler/context/AppContext';
import * as React from 'react';
import AuthContext from 'shared/auth/AuthContext';
import BaseLayout from 'shared/components/layout/Layout';
import styled from 'styled-components';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => {
  const { layoutBackgroundColor } = React.useContext(AppContext);
  const { isLoading } = React.useContext(AuthContext);
  if (isLoading) {
    return null;
  }
  return (
    <BaseLayout
      css={`
        background-color: ${layoutBackgroundColor};
      `}
    >
      {children}
    </BaseLayout>
  );
};

interface StyledProps {
  backgroundColor?: string;
}
export const $BackgroundWrapper = styled.div<StyledProps>`
  background-color: ${(props) => (props ? props.backgroundColor : '#fff')};
  height: 100%;
`;

export default Layout;
