import React from 'react';
import { $ErrorTextWrapper } from './ErrorText.sc';

const ErrorText: React.FC = ({ children }) => {
  return (
    <$ErrorTextWrapper>
      <div>{children}</div>
    </$ErrorTextWrapper>
  );
};

export default ErrorText;
