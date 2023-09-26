import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $CompanyInfoRow = styled.div`
  display: flex;
  font-size: 1.1em;
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.s};
  align-items: flex-start;
  flex-flow: column wrap;
  ${respondAbove('xs')`
    align-items: center;
    flex-flow: row;
  `};
`;

export const $CompanyInfoLabel = styled.dt`
  min-width: 130px;
  font-weight: 500;
  margin-right: ${(props) => props.theme.spacing.m};
`;

export const $CompanyInfoValue = styled.dd`
  margin-right: ${(props) => props.theme.spacing.xs};
  margin-inline-start: 0;
  display: inline-flex;
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
