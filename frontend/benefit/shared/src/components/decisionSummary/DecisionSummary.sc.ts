import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import { ThemeProps } from 'shared/styles/theme';
import styled from 'styled-components';

export const $DecisionBox = styled.section`
  background-color: ${(props: ThemeProps) => props.theme.colors.silverLight};
  border-bottom: ${(props: ThemeProps) =>
    `${props.theme.spacing.xs2} solid ${props.theme.colors.coatOfArmsMediumLight}`};
  padding: ${(props: ThemeProps) => props.theme.spacingLayout.s};
  margin-bottom: ${(props: ThemeProps) => props.theme.spacingLayout.m};
`;

export const $DecisionBoxTitle = styled.h2`
  margin: 0;
  font-size: ${(props: ThemeProps) => props.theme.fontSize.heading.l};
  font-weight: 300;
`;

export const $DecisionNumber = styled.div`
  margin: ${(props: ThemeProps) => props.theme.spacingLayout.xs} 0;
`;

export const $Subheading = styled.h2`
  border-bottom: ${(props: ThemeProps) => `1px solid ${props.theme.colors.black20}`};
  padding-bottom: ${(props: ThemeProps) => props.theme.spacing.xs};
  margin: ${(props: ThemeProps) => props.theme.spacing.xs} 0
    ${(props: ThemeProps) => props.theme.spacing.s};
  font-weight: 500;
  font-size: ${(props: ThemeProps) => props.theme.fontSize.heading.s};
`;

export const $DecisionDetails = styled($Grid)`
  margin: ${(props: ThemeProps) => props.theme.spacing.l} 0
    ${(props: ThemeProps) => props.theme.spacing.s};
  row-gap: ${(props: ThemeProps) => props.theme.spacing.l};

  dt {
    font-weight: 500;
    margin-bottom: ${(props: ThemeProps) => props.theme.spacing.s};
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
  gap: ${(props: ThemeProps) => props.theme.spacing.s};
  margin-top: ${(props: ThemeProps) => props.theme.spacing.m};
  margin-bottom: ${(props: ThemeProps) => props.theme.spacing.xl};
`;

export const $AlterationActionContainer = styled($DecisionActionContainer)`
  margin-bottom: 0;
`;
