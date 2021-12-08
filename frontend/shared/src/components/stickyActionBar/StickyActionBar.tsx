import * as React from 'react';
import Container from 'shared/components/container/Container';

import { $Wrapper } from './StickyActionBar.sc';

type Props = { children: React.ReactNode };

const StickyActionBar: React.FC<Props> = ({ children }) => (
    <$Wrapper>
      <Container>{children}</Container>
    </$Wrapper>
  );

export default StickyActionBar;
