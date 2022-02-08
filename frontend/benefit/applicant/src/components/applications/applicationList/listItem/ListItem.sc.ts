import styled, { DefaultTheme } from 'styled-components';

interface AvatarProps {
  $backgroundColor: keyof DefaultTheme['colors'];
}

export const $ListItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const $ListItem = styled.li`
  display: flex;
  background-color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xs};
  justify-content: space-between;
`;

export const $ItemContent = styled.div`
  display: grid;
  grid-template-columns: 60px 3fr repeat(4, minmax(100px, 2fr));
  grid-gap: ${(props) => props.theme.spacing.m};
  width: 100%;
`;

export const $Avatar = styled.div<AvatarProps>`
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

export const $DataColumn = styled.div`
  color: ${(props) => props.theme.colors.black90};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const $DataHeader = styled.div`
  display: flex;
`;

export const $DataValue = styled.div`
  display: flex;
  font-weight: 600;
`;

export const $ItemActions = styled.div`
  display: grid;
  justify-content: stretch;
  align-items: center;
  width: 160px;
  min-width: 160px;
`;

export const $ListInfo = styled.div`
  display: grid;
  grid-template-columns: 60px 3fr;
  grid-gap: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.coatOfArms};
  padding: ${(props) => props.theme.spacing.xs2};
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.l};
`;

export const $ListInfoInner = styled.div`
  display: flex;
  align-items: center;
`;

export const $ListInfoText = styled.div`
  padding: 0 ${(props) => props.theme.spacing.xs2};
`;
