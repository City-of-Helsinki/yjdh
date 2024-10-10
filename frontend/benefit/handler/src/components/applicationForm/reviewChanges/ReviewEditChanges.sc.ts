import styled from 'styled-components';

type $ChangeRowValueProps = {
  direction?: 'column' | 'row';
};

export const $ChangeRowValue = styled.dd<$ChangeRowValueProps>`
  display: flex;
  flex-direction: ${(props) =>
    props.direction === 'column' ? 'column' : 'row'};
  margin-left: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs};

  svg {
    margin: 0 ${(props) => props.theme.spacing.xs3};
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

export const $ChangeSet = styled.div`
  background: ${(props) => props.theme.colors.silverLight};
  padding: ${(props) => props.theme.spacing.s};
  font-size: 0.99em;
  margin-bottom: ${(props) => props.theme.spacing.xs};
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
    color: ${(props) => props.theme.colors.black50};
  }
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

export const $ChangeSetFooter = styled.div``;
