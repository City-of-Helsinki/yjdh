import styled from 'styled-components';

export const $CompanyInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 25% 12% 25% 13% 12% 13%;
  grid-template-rows: 50% 50%;
  width: 100%;
  padding-bottom: ${(props) => props.theme.spacing.s};
`;

export const $CompanyInfoHeader = styled.div`
  font-weight: 500;
`;

export const $CompanyInfoCell = styled.div`
  font-size: 18px;
`;
