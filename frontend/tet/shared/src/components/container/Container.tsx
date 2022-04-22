// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from 'react';

import { $Container, $Inner } from './Container.sc';

type ContainerProps = { children: React.ReactNode; backgroundColor?: string };

const Container: React.FC<ContainerProps> = ({
  children,
  backgroundColor = '',
}: ContainerProps) => (
  <$Container backgroundColor={backgroundColor}>
    <$Inner>{children}</$Inner>
  </$Container>
);

const defaultProps = {
  backgroundColor: '',
};

Container.defaultProps = defaultProps;

export default Container;
