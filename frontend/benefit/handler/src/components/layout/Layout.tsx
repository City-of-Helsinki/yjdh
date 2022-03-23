import AppContext from 'benefit/handler/context/AppContext';
import * as React from 'react';
import BaseLayout from 'shared/components/layout/Layout';

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children }) => {
  const { layoutBackgroundColor } = React.useContext(AppContext);
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

export default Layout;
