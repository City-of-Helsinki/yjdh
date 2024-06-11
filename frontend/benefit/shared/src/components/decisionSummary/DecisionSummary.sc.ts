import { $Grid } from 'shared/components/forms/section/FormSection.sc';
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

export const $DecisionDetails = styled($Grid)`
  margin: ${(props) => props.theme.spacing.l} 0
    ${(props) => props.theme.spacing.s};
  row-gap: ${(props) => props.theme.spacing.l};

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
