import { Button } from 'hds-react';
import React from 'react';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme>;

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: ${(props: Props) => props.theme.spacing.m};
`;

const StyledTextContainer = styled.div`
  flex: 1 0 50%;
  box-sizing: border-box;
`;

const StyledHeading = styled.h1`
  font-size: ${(props: Props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

const StyledDescription = styled.p`
  font-size: ${(props: Props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props: Props) => props.theme.lineHeight.l};
`;

const StyledLink = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const StyledActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 0 50%;
  box-sizing: border-box;
`;

interface ButtonProps {
  icon?: React.ReactNode;
}

const StyledButton = styled(Button)<ButtonProps>`
  background-color: ${(props: Props) =>
    props.theme.colors.coatOfArms} !important;
  border-color: ${(props: Props) => props.theme.colors.coatOfArms} !important;
`;

const StyledCompanyInfoContainer = styled.div`
  display: flex;
  width:100%;
`;

const StyledCompanyInfoSection = styled.div`
  display: flex;
  flex: 1 0 50%;
`;

const StyledCompanyInfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 50%;
`;

const StyledCompanyInfoRow = styled.div`
  display: flex;
`;

const StyledNotificationContent = styled.div`
  font-size: ${(props: Props) => props.theme.fontSize.heading.xs};
`;

const StyledSubSection = styled.div`
  width:100%;
  margin-left:200px;
  
  textarea {
    width: 640px !important;
  }
`;

export {
  StyledActionContainer,
  StyledButton,
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledNotificationContent,
  StyledSubSection,
  StyledTextContainer};
