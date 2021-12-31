import { Button, IconCross } from 'hds-react';
import React from 'react';

import {
  $Body,
  $Bottom,
  $CloseBtnWrapper,
  $Drawer,
  $Title,
  $Top,
} from './Drawer.sc';

export type DrawerProps = {
  title?: string;
  footer?: React.ReactNode;
  isOpen: boolean;
  closeBtnAriaLabel: string;
  handleClose: () => void;
};

const Drawer: React.FC<DrawerProps> = ({
  title,
  isOpen,
  children,
  footer,
  closeBtnAriaLabel,
  handleClose,
}) => {
  if (!isOpen) return null;

  return (
    <$Drawer>
      <$Top>
        <$CloseBtnWrapper>
          <Button
            variant="supplementary"
            size="small"
            theme="black"
            onClick={handleClose}
            aria-label={closeBtnAriaLabel}
            iconLeft={<IconCross />}
          />
        </$CloseBtnWrapper>
        <$Title>{title}</$Title>
      </$Top>
      {children && <$Body>{children}</$Body>}
      {footer && <$Bottom>{footer}</$Bottom>}
    </$Drawer>
  );
};

export default Drawer;
