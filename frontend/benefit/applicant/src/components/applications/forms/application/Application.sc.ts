import styled from 'styled-components';

export const $ViewFieldsContainer = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $ViewFieldsGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: ${(props) => props.theme.spacing.xl2};
`;

export const $ViewField = styled.span`
  font-weight: 400;
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;

export const $ViewListContainer = styled.div``;

export const $ViewListRow = styled.div`
  display: grid;
  grid-template-columns: 400px 300px 300px;
`;

export const $ViewListHeading = styled.div`
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;
