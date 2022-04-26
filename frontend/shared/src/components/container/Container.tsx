import * as React from 'react';

import { $Container, $Inner, ContainerProps } from './Container.sc';

type Props = React.PropsWithChildren<ContainerProps>;

const Container: React.FC<Props> = ({ children, ...props }) => (
  <$Container {...props}>
    <$Inner>{children}</$Inner>
  </$Container>
);

export default Container;
