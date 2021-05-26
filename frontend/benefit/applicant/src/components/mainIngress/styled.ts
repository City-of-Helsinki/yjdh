import styled from 'styled-components';
import { Button } from 'hds-react';
import React from 'react';

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTextContainer = styled.div`
  flex: 1 0 50%;
  box-sizing: border-box;
`;

const StyledHeading = styled.h1`
  font-size: 52px;
  font-weight: normal;
  height: 52px;
  line-height: 52px;
`;

const StyledDescription = styled.p`
  font-size: 20px;
  font-weight: normal;
  line-height: 32px;
`;

const StyledLink = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const StyledActionContainer = styled.div`
  display:flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 0 50%;
  box-sizing: border-box;
`;

interface ButtonProps {
  icon?: React.ReactNode
}

const StyledButton = styled(Button)<ButtonProps>`
  background-color: ${props => props.theme.colors.blue} !important;
  border-color: ${props => props.theme.colors.blue} !important;
`;

export {
  StyledContainer,
  StyledTextContainer,
  StyledHeading,
  StyledDescription,
  StyledLink,
  StyledActionContainer,
  StyledButton
}