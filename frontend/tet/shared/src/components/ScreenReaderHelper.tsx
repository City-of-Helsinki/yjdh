import React from 'react';
import styled from 'styled-components';

const SRHelper = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const ScreenReaderHelper: React.FC = ({ children }) => {
  return <SRHelper>{children}</SRHelper>;
};

export default ScreenReaderHelper;
