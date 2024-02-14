import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

interface AvatarProps {
  $backgroundColor: keyof DefaultTheme['colors'];
}

export const $ListItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const $ListItem = styled.li`
  display: block;
  background-color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xs};
  justify-content: space-between;

  ${respondAbove('md')`
    display: flex;
  `};
`;

export const $ItemContent = styled.div`
  display: grid;
  grid-gap: ${(props) => props.theme.spacing.m};
  width: 100%;
  margin-bottom: var(--spacing-s);

  ${respondAbove('xs')`
    grid-template-columns: 1fr 1fr;
  `};

  ${respondAbove('sm')`
    grid-template-columns: 60px 3fr repeat(4, minmax(100px, 3fr));
  `};
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
  grid-column: 1 / -1;
  ${respondAbove('sm')`
    grid-column: 1;
  `};
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
  font-weight: 500;
`;

export const $StatusDataColumn = styled($DataColumn)`
  &.list-item-status--${APPLICATION_STATUSES.INFO_REQUIRED} {
    ${respondAbove('sm')`
      grid-column: span 2;
    `};
  }
`;

export const $StatusDataValue = styled($DataValue)`
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs3};

  .list-item-status--${APPLICATION_STATUSES.HANDLING} & {
    svg {
      color: ${(props) => props.theme.colors.info};
    }
  }

  .list-item-status--${APPLICATION_STATUSES.ACCEPTED} & {
    svg {
      color: ${(props) => props.theme.colors.success};
    }
  }

  .list-item-status--${APPLICATION_STATUSES.REJECTED} &,
  .list-item-status--${APPLICATION_STATUSES.CANCELLED} & {
    svg {
      color: ${(props) => props.theme.colors.error};
    }
  }

  .list-item-status--${APPLICATION_STATUSES.INFO_REQUIRED} & {
    color: ${(props) => props.theme.colors.alertDark};
  }
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
  cursor: pointer;
`;

export const $ListInfoText = styled.div`
  padding: 0 ${(props) => props.theme.spacing.xs2};
`;
