import { Button as HdsButton, ButtonProps as HdsButtonProps } from 'hds-react';
import React from 'react';
import styled from 'styled-components';

type StyledButtonProps = Omit<HdsButtonProps, 'children'> & {
  children?: React.ReactNode;
  className?: string;
};

const StyledButtonBase = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({ className, ...props }, ref) => (
    <HdsButton {...(props as HdsButtonProps)} className={className} ref={ref} />
  )
);

StyledButtonBase.displayName = 'StyledButtonBase';

const $Button = styled(StyledButtonBase)`
  hyphens: none;
  overflow-wrap: normal;
`;

export default $Button;
