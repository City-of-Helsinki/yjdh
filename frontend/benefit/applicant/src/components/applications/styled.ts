import { Button } from 'hds-react';
import { Theme } from 'shared/styles/theme';
import styled from 'styled-components';

import { APPLICATION_STATUSES } from './constants';

interface AvatarProps {
  status: string
}

const StyledWrapper = styled.div`
  display:flex;
  flex-direction: column;
`;

const StyledHeading = styled.h1`
  font-size: ${props => (props.theme as Theme).fontSize.heading.m};
  font-weight: 500;
`;

const StyledListWrapper = styled.div`
  display:flex;
  flex-direction: column;
`;

const StyledListItem = styled.div`
  display:flex;
  background-color: ${props => (props.theme as Theme).colors.white};
  padding: ${props => (props.theme as Theme).spacing.xs};
  justify-content: space-between;
  margin-bottom: ${props => (props.theme as Theme).spacing.xs2};
`;

const StyledItemContent = styled.div`
  display:flex;
`;

const StyledAvatar = styled.div<AvatarProps>`
  ${(props) =>
    props.status === APPLICATION_STATUSES.DRAFT &&
    `
      background-color: ${(props.theme as Theme).colors.black40};
  `}

  ${(props) =>
      props.status === APPLICATION_STATUSES.INFO_REQUIRED &&
      `
        background-color: ${(props.theme as Theme).colors.alertDark};
    `}
  
  ${(props) =>
      props.status === APPLICATION_STATUSES.RECEIVED &&
      `
        background-color: ${(props.theme as Theme).colors.info};
    `}

  ${(props) =>
      props.status === APPLICATION_STATUSES.APPROVED &&
      `
        background-color: ${(props.theme as Theme).colors.success};
    `}

  ${(props) =>
      props.status === APPLICATION_STATUSES.REJECTED &&
      `
        background-color: ${(props.theme as Theme).colors.error};
    `}

  color: ${props => (props.theme as Theme).colors.white};
  font-size: ${props => (props.theme as Theme).fontSize.heading.xs};
  font-weight: 600;
  display:flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 60px;
  width:60px;
  min-height: 60px;
  min-width:60px;
`;

const StyledDataColumn = styled.div`
  color: ${props => (props.theme as Theme).colors.black90};
  display:flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 ${props => (props.theme as Theme).spacing.m};

`;

const StyledDataHeader = styled.div`
  display:flex;
  line-height: ${props => (props.theme as Theme).lineHeight.xl};
`;

const StyledDataValue = styled.div`
  display:flex;
  line-height: ${props => (props.theme as Theme).lineHeight.xl};
  font-weight: 600;
`;

const StyledItemActions = styled.div`
  display:flex;
`;

const StyledSecondaryButton = styled(Button)`
  color: ${props => (props.theme as Theme).colors.black90} !important;
  border-color: ${props => (props.theme as Theme).colors.black90} !important;
  border-width: 3px !important;
  width:170px;
`;

const StyledPrimaryButton = styled(Button)`
  background-color: ${props => (props.theme as Theme).colors.coatOfArms} !important;
  border-color: ${props => (props.theme as Theme).colors.coatOfArms} !important;
  border-width: 3px !important;
  width:170px;
`;


export {
  StyledAvatar,
  StyledDataColumn,
  StyledDataHeader,
  StyledDataValue,
  StyledHeading,
  StyledItemActions,
  StyledItemContent,
  StyledListItem,
  StyledListWrapper,
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledWrapper,
}