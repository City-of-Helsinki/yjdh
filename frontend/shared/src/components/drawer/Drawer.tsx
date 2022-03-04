import { IconCross } from 'hds-react';
import React from 'react';

import { $Body, $Bottom, $Close, $Drawer, $Title, $Top } from './Drawer.sc';

export type DrawerProps = {
  title?: string;
  closeText?: string;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
};

const Drawer: React.FC<DrawerProps> = ({
  title,
  isOpen,
  children,
  footer,
  closeText,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <$Drawer>
      {title && (
        <$Top>
          <$Title>{title}</$Title>
        </$Top>
      )}
      {onClose && (
        <$Close onClick={onClose}>
          <IconCross />
          <p>{closeText}</p>
        </$Close>
      )}
      {children && <$Body>{children}</$Body>}
      {footer && <$Bottom>{footer}</$Bottom>}
    </$Drawer>
  );
};

Drawer.defaultProps = {
  title: undefined,
  closeText: undefined,
  footer: null,
  onClose: undefined,
};

export default Drawer;
