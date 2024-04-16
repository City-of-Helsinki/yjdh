import styled from 'styled-components';

export const $CompanyInfoWrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 460px;
  grid-template-rows: repeat(5, 50px);
  font-size: 1.1em;
`;

export const $CompanyInfoLabel = styled.dt`
  font-size: 1.1em;
  font-weight: 500;
`;

export const $CompanyInfoValue = styled.dd`
  font-size: 1.1em;
`;

export const $IconWrapper = styled.span<{ $isBeginning?: boolean }>`
  svg {
    margin-left: ${(props) =>
      !props.$isBeginning ? props.theme.spacing.xs2 : 0};
    margin-right: ${(props) =>
      props.$isBeginning ? props.theme.spacing.xs2 : 0};
    position: relative;
    top: 5px;
  }
`;
