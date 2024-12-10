import { 
    Button, 
    IconCheck, 
  } from 'hds-react';
import React from "react";


interface InstalmentButtonProps {
  isLoading: boolean;
  isLoadingStatusChange: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
  
const InstalmentButton: React.FC<InstalmentButtonProps> = ({
  isLoading,
  isLoadingStatusChange,
  onClick,
  children 
}) => (
    <Button
      disabled={isLoading || isLoadingStatusChange}
      theme="coat"
      iconLeft={<IconCheck />}
      onClick={onClick}
    >
      {children}
    </Button>
  );

export default InstalmentButton;