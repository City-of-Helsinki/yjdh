import { respondAbove } from 'shared/styles/mediaQueries';
import styled, { DefaultTheme } from 'styled-components';

export const $PageHeading = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

type SectionProps = {
  $headingBottomBorder: boolean;
  theme: DefaultTheme;
};

export const $Section = styled.section<SectionProps>`
  background-color: ${(props: SectionProps) => props.theme.colors.silverLight};
  padding: ${(props: SectionProps) => props.theme.spacing.l};
  margin-bottom: ${(props: SectionProps) => props.theme.spacing.m};

  h2 {
    padding-bottom: ${(props: SectionProps) => props.theme.spacing.s};
    margin: 0 0 ${(props: SectionProps) => props.theme.spacing.xs} 0;
  }
  ${(props: SectionProps) => {
    if (props.$headingBottomBorder) {
      return `
        h2 {
          border-bottom: 1px solid ${props.theme.colors.black20};
          margin-bottom: ${props.theme.spacing.l};
        }
      `;
    }

    return '';
  }}
`;

export const $AlterationDetails = styled.dl`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  box-sizing: border-box;
  margin: 0 calc(${(props: SectionProps) => props.theme.spacing.s} * -1);

  ${respondAbove('md')`
    flex-direction: row;
    justify-content: stretch;

    div {
      width: 25%;
    }
  `};

  div {
    box-sizing: border-box;
    padding: ${(props: SectionProps) => props.theme.spacing.s};
  }

  dt {
    font-weight: 500;
    margin-bottom: ${(props: SectionProps) => props.theme.spacing.s};
  }

  dd {
    margin: 0;
  }
`;

export const $StickyBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $StickyBarColumn = styled.div`
  display: flex;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $TalpaGuideText = styled.p`
  margin: ${(props: { theme: DefaultTheme }) =>
    `0 0 ${props.theme.spacing.l} 0`};
`;

export const $SaveActionFormErrorText = styled.div`
  ${respondAbove('sm')`
    text-align: right;
  `};

  display: flex;
  align-items: center;
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.error};
  svg {
    width: 48px;
    fill: ${(props: { theme: DefaultTheme }) => props.theme.colors.error};
  }
`;
