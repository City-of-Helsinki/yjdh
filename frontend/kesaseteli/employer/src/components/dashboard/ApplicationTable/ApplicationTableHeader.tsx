import React from 'react';

type HeaderProps = {
  children?: React.ReactNode;
};

const ApplicationTableHeader: React.FC<HeaderProps> = ({ children }) => (
  <h2>{children}</h2>
);

export default ApplicationTableHeader;
