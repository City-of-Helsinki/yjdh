import styled from 'styled-components';

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $CompanyInfoField = styled.div`
  line-height: ${(props) => props.theme.lineHeight.l};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
`;

export const $CompanyInfoHeader = styled.div`
  font-weight: bold;
`;
