import styled, { DefaultTheme } from 'styled-components';

type $ChangeRowValueProps = {
  direction?: 'column' | 'row';
  theme: DefaultTheme;
};

export const $ChangeRowValue = styled.dd<$ChangeRowValueProps>`
  display: flex;
  flex-direction: ${(props: $ChangeRowValueProps) =>
    props.direction === 'column' ? 'column' : 'row'};
  margin-left: 0;
  margin-bottom: ${(props: $ChangeRowValueProps) => props.theme.spacing.xs};

  svg {
    margin: 0 ${(props: $ChangeRowValueProps) => props.theme.spacing.xs3};
    width: 18px;
    min-width: 18px;
    height: 18px;
    min-height: 18px;
  }

  span {
    white-space: normal;
  }
`;

export const $ChangeRowLabel = styled.dt`
  margin: 0;
`;

type $ChangeSetProps = {
  isChangeByStaff: boolean;
  theme: DefaultTheme;
};
export const $ChangeSet = styled.div<$ChangeSetProps>`
  background: ${(props: $ChangeSetProps) =>
    props.isChangeByStaff
      ? props.theme.colors.silverLight
      : props.theme.colors.fogLight};
  padding: ${(props: $ChangeSetProps) => props.theme.spacing.s};
  font-size: 0.99em;
  margin-bottom: ${(props: $ChangeSetProps) => props.theme.spacing.xs};
`;

export const $ChangeSetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  span:first-child {
    font-weight: 500;
  }
  span:last-child {
    font-size: 0.9em;
    color: ${(props: $ChangeSetProps) => props.theme.colors.black50};
  }
  margin-bottom: ${(props: $ChangeSetProps) => props.theme.spacing.s};
`;

export const $ChangeSetFooter = styled.div``;
