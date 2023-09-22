import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

type $CompanyInfoWrapperProps = {
  $fontSize?: string;
};
type $CompanyInfoRowProps = {
  $alignItems?: string;
};
type $CompanyInfoValueProps = {
  $column?: boolean;
};

export const $CompanyInfoWrapper = styled.dl<$CompanyInfoWrapperProps>`
  font-size: ${(props) =>
    props.$fontSize ? String(props.$fontSize) : props.theme.fontSize.body.m};
`;

export const $CompanyInfoRow = styled.div<$CompanyInfoRowProps>`
  display: flex;
  font-size: 1.1em;
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: calc(${(props) => props.theme.spacing.xl} / 2);
  align-items: ${(props) =>
    props.$alignItems ? props.$alignItems : 'flex-start'};
  flex-flow: column wrap;
  ${respondAbove('xs')`
    flex-flow: row;
  `}

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const $CompanyInfoLabel = styled.dt`
  min-width: calc(${(props) => props.theme.spacing.s} * 10);
  max-width: calc(${(props) => props.theme.spacing.s} * 10);
  font-weight: 500;
  margin-right: ${(props) => props.theme.spacing.m};
`;

export const $CompanyInfoValue = styled.dd<$CompanyInfoValueProps>`
  margin-right: ${(props) => props.theme.spacing.xs};
  margin-inline-start: 0;
  display: ${(props) => (props.$column ? 'flex-start' : 'inline-flex')};
  svg {
    margin-left: ${(props) => props.theme.spacing.xs2};
  }
`;

export const $HintText = styled.section`
  display: flex;
  flex-flow: row;
  font-size: 1.1em;
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  svg {
    margin-right: ${(props) => props.theme.spacing.xs};
    min-width: ${(props) => props.theme.spacing.m};
  }
`;
