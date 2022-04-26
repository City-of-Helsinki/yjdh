import * as React from 'react';

import { $Container, $Inner, ContainerProps } from './Container.sc';

type ContainerProps = { children: React.ReactNode; backgroundColor?: string };

const Container: React.FC<ContainerProps> = ({
  children,
  ...props
}: ContainerProps) => (
  <$Container {...props}>
    <$Inner>{children}</$Inner>
  </$Container>
);

const defaultProps = {
  backgroundColor: '',
};

Container.defaultProps = defaultProps;

export default Container;
