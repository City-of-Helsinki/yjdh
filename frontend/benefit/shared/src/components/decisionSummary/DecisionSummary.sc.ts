import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $DecisionBox = styled.section`
  background-color: ${(props) => props.theme.colors.silverLight};
  border-bottom: ${(props) =>
    `${props.theme.spacing.xs2} solid ${props.theme.colors.coatOfArmsMediumLight}`};
  padding: ${(props) => props.theme.spacingLayout.s};
  margin-bottom: ${(props) => props.theme.spacingLayout.m};
`;

export const $DecisionBoxTitle = styled.h2`
  margin: 0;
  font-size: ${(props) => props.theme.fontSize.heading.l};
  font-weight: 300;
`;

export const $DecisionNumber = styled.div`
  margin: ${(props) => props.theme.spacingLayout.xs} 0;
`;

export const $Subheading = styled.h2`
  border-bottom: ${(props) => `1px solid ${props.theme.colors.black20}`};
  padding-bottom: ${(props) => props.theme.spacing.xs};
  margin: ${(props) => props.theme.spacing.xs} 0
    ${(props) => props.theme.spacing.s};
  font-weight: 500;
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $DecisionDetails = styled.dl`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  box-sizing: border-box;
  margin: 0 calc(${(props) => props.theme.spacing.s} * -1);

  ${respondAbove('md')`
    flex-direction: row;
    justify-content: stretch;

    div {
      width: 25%;
    }
  `};

  div {
    box-sizing: border-box;
    padding: ${(props) => props.theme.spacing.s};
  }

  dt {
    font-weight: 500;
    margin-bottom: ${(props) => props.theme.spacing.s};
  }

  dd {
    margin: 0;
  }
`;

export const $AlterationListCount = styled.div``;

export const $DecisionActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.s};
  margin-top: ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const $AlterationActionContainer = styled($DecisionActionContainer)`
  margin-bottom: 0;
`;