import { Notification } from 'hds-react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  padding-bottom: ${(props) => props.theme.spacing.m};
`;

const StyledTextContainer = styled.div`
  display: flex;
  box-sizing: border-box;
`;

const StyledHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

const StyledDescription = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

const StyledLink = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const StyledActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
`;

const StyledNotification = styled(Notification)`
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

export {
  StyledActionContainer,
  StyledContainer,
  StyledDescription,
  StyledHeading,
  StyledLink,
  StyledNotification,
  StyledTextContainer,
};
