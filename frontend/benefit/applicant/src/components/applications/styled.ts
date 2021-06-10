import { APPLICATION_STATUSES } from 'benefit/applicant/components/applications/constants';
import { Button } from 'hds-react';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme> & { status?: APPLICATION_STATUSES };

interface AvatarProps {
  status: APPLICATION_STATUSES;
}

const avatarBackgroundColors = (
  theme: Theme,
  status?: APPLICATION_STATUSES
): string => {
  const colors = {
    [APPLICATION_STATUSES.DRAFT]: theme.colors.black40,
    [APPLICATION_STATUSES.INFO_REQUIRED]: theme.colors.alertDark,
    [APPLICATION_STATUSES.RECEIVED]: theme.colors.info,
    [APPLICATION_STATUSES.APPROVED]: theme.colors.success,
    [APPLICATION_STATUSES.REJECTED]: theme.colors.error,
  };
  return colors[status || APPLICATION_STATUSES.DRAFT];
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHeading = styled.h1`
  font-size: ${(props: Props) => props.theme.fontSize.heading.m};
  font-weight: 500;
`;

const StyledListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledListItem = styled.div`
  display: flex;
  background-color: ${(props: Props) => props.theme.colors.white};
  padding: ${(props: Props) => props.theme.spacing.xs};
  justify-content: space-between;
  margin-bottom: ${(props: Props) => props.theme.spacing.xs2};
`;

const StyledItemContent = styled.div`
  display: flex;
`;

const StyledAvatar = styled.div<AvatarProps>`
  ${(props: Props) => `
    background-color: ${avatarBackgroundColors(props.theme, props.status)};
    color: ${props.theme.colors.white};
    font-size: ${props.theme.fontSize.heading.xs};
  `}
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 60px;
  width: 60px;
  min-height: 60px;
  min-width: 60px;
`;

const StyledDataColumn = styled.div`
  color: ${(props: Props) => props.theme.colors.black90};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 ${(props: Props) => props.theme.spacing.m};
  &:nth-child(2) {
    width: 140px;
  }
`;

const StyledDataHeader = styled.div`
  display: flex;
  line-height: ${(props: Props) => props.theme.lineHeight.xl};
`;

const StyledDataValue = styled.div`
  display: flex;
  line-height: ${(props: Props) => props.theme.lineHeight.xl};
  font-weight: 600;
`;

const StyledItemActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledSecondaryButton = styled(Button)`
  color: ${(props: Props) => props.theme.colors.black90} !important;
  border-color: ${(props: Props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

const StyledPrimaryButton = styled(Button)`
  background-color: ${(props: Props) =>
    props.theme.colors.coatOfArms} !important;
  border-color: ${(props: Props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
  width: 170px;
`;

const StyledSupplementaryButton = styled(Button)`
  color: ${(props: Props) => props.theme.colors.black90} !important;
  min-width: 170px;
  max-height: 60px;
  margin-top: ${(props: Props) => props.theme.spacing.xs2};
`;

const StyledPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props: Props) => props.theme.spacing.m};
  margin-top: ${(props: Props) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

const StyledHeaderItem = styled.div``;

const StyledPageHeading = styled.h1`
  font-size: ${(props: Props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;

const StyledApplicationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props: Props) => props.theme.spacing.l};
`;

const StyledApplicationAction = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmpty = styled.div``;

export {
  StyledApplicationAction,
  StyledApplicationActions,
  StyledAvatar,
  StyledDataColumn,
  StyledDataHeader,
  StyledDataValue,
  StyledEmpty,
  StyledHeaderItem,
  StyledHeading,
  StyledItemActions,
  StyledItemContent,
  StyledListItem,
  StyledListWrapper,
  StyledPageHeader,
  StyledPageHeading,
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledSupplementaryButton,
  StyledWrapper,
};
