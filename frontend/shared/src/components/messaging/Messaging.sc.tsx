import styled from 'styled-components';

interface MessageProps {
  isPrimary?: boolean;
}

export const $MessagesList = styled.div`
  height: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

export const $Meta = styled.div`
  width: 100%;
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

export const $MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const $Message = styled.div<MessageProps>`
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${(props) =>
    props.isPrimary
      ? props.theme.colors.coatOfArmsLight
      : props.theme.colors.black5};
  border-radius: 10px;
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
