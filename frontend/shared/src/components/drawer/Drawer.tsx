import React from 'react';
import { $Body, $Bottom, $Drawer, $Title, $Top } from './Drawer.sc';

export type DrawerProps = {
  title?: string;
  footer?: React.ReactNode;
  isOpen: boolean;
};

const Drawer: React.FC<DrawerProps> = ({ title, isOpen, children, footer }) => {
  if (!isOpen) return null;

  return (
    <$Drawer>
      {title && (
        <$Top>
          <$Title>{title}</$Title>
        </$Top>
      )}
      {children && <$Body>{children}</$Body>}
      {footer && <$Bottom>{footer}</$Bottom>}
    </$Drawer>
  );
};

export default Drawer;
