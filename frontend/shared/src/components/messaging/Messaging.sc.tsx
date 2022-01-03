import styled from 'styled-components';

export const $Meta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.s};
`;

export const $Sender = styled.span`
  font-weight: 500;
`;

export const $Date = styled.span`
  font-size: ${({ theme }) => theme.fontSize.body.s};
  color: ${({ theme }) => theme.colors.black50};
`;

export const $Message = styled.div`
  padding: ${({ theme }) => theme.spacing.s};
  background: ${({ theme }) => theme.colors.black5};
  border-radius: 10px;
  max-width: 18em;
  margin-bottom: ${({ theme }) => theme.spacing.s};
`;

export const $Actions = styled.div`
  /* background-color: ${({ theme }) => theme.colors.black5}; */
`;

export const $FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;
