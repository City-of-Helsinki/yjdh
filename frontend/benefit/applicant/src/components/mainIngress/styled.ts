import { Button } from 'hds-react';
import React from 'react';
import { Theme } from 'shared/styles/theme';
import styled from 'styled-components';

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${props => (props.theme as Theme).spacing.m};
`;

const StyledTextContainer = styled.div`
  flex: 1 0 50%;
  box-sizing: border-box;
`;

const StyledHeading = styled.h1`
  font-size: ${props => (props.theme as Theme).fontSize.heading.xl};
  font-weight: normal;
`;

const StyledDescription = styled.p`
  font-size: ${props => (props.theme as Theme).fontSize.heading.s};
  font-weight: normal;
  line-height: ${props => (props.theme as Theme).lineHeight.l};
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
  background-color: ${props => (props.theme as Theme).colors.coatOfArms} !important;
  border-color: ${props => (props.theme as Theme).colors.coatOfArms} !important;
`;

export {
  StyledActionContainer,
  StyledButton,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledTextContainer}