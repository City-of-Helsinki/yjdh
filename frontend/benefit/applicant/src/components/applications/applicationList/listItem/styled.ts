import styled, { DefaultTheme } from 'styled-components';

interface AvatarProps {
  $backgroundColor: keyof DefaultTheme['colors'];
}

const StyledListItem = styled.li`
  display: flex;
  background-color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xs};
  justify-content: space-between;
`;

const StyledItemContent = styled.div`
  display: grid;
  grid-template-columns: 60px 3fr repeat(4, minmax(100px, 2fr));
  grid-gap: ${(props) => props.theme.spacing.m};
  width: 100%;
`;

const StyledAvatar = styled.div<AvatarProps>`
  ${(props) => `
    background-color: ${props.theme.colors[props.$backgroundColor]};
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
  color: ${(props) => props.theme.colors.black90};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const StyledDataHeader = styled.div`
  display: flex;
`;

const StyledDataValue = styled.div`
  display: flex;
  font-weight: 600;
`;

const StyledItemActions = styled.div`
  display: grid;
  justify-content: stretch;
  align-items: center;
  width: 160px;
  min-width: 160px;
`;

export {
  StyledAvatar,
  StyledDataColumn,
  StyledDataHeader,
  StyledDataValue,
  StyledItemActions,
  StyledItemContent,
  StyledListItem,
};
