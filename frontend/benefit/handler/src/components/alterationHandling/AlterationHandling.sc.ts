import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $PageHeading = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

type SectionProps = {
  $headingBottomBorder: boolean;
};

export const $Section = styled.section<SectionProps>`
  background-color: ${(props) => props.theme.colors.silverLight};
  padding: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.m};

  h2 {
    padding-bottom: ${(props) => props.theme.spacing.s};
    margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
  }
  ${(props) => {
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

export const $StickyBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $StickyBarColumn = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.s};
`;

export const $TalpaGuideText = styled.p`
  margin: ${(props) => `0 0 ${props.theme.spacing.l} 0`};
`;

export const $SaveActionFormErrorText = styled.div`
  ${respondAbove('sm')`
    text-align: right;
  `};

  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.error};
  svg {
    width: 48px;
    fill: ${(props) => props.theme.colors.error};
  }
`;
