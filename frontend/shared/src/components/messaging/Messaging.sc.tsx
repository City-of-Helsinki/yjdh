import { MessageVariant } from 'shared/types/messages';
import styled, { DefaultTheme } from 'styled-components';

interface MessageProps {
  isPrimary?: boolean;
  alignRight?: boolean;
  variant: MessageVariant;
}

interface MetaProps {
  wrapAsColumn?: boolean;
  alignRight?: boolean;
}

interface MessageListProps {
  variant: MessageVariant;
}

export const $MessagesList = styled.div<MessageListProps>`
  display: flex;
  flex-direction: column;
  height: 0;
  flex-grow: 1;
  overflow-y: auto;
  margin-top: ${(props: { theme: DefaultTheme } & MessageListProps) =>
    props.variant === 'note' ? props.theme.spacing.m : 0};
  background-color: ${(props: { theme: DefaultTheme } & MessageListProps) =>
    props.variant === 'note' ? props.theme.colors.silverLight : ''};
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs};
`;

export const $Meta = styled.div<MetaProps>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.s};
  flex-flow: ${(props: MetaProps) => (props.wrapAsColumn ? 'column' : 'row')};
  text-align: ${(props: MetaProps) => (props.alignRight ? 'right' : 'left')};
`;

export const $Sender = styled.span`
  font-weight: 500;
`;

export const $Date = styled.span`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSize.body.s};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.black50};
`;

export const $SeenByUser = styled.span`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSize.body.s};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.black50};
`;

export const $MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const $Message = styled.div<MessageProps>`
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs};
  background: ${(props: { theme: DefaultTheme } & MessageProps) =>
    props.isPrimary
      ? props.theme.colors.coatOfArmsLight
      : props.theme.colors.black5};
  background: ${(props: MessageProps) => props.variant === 'note' && 'none'};
  border-radius: ${(props: MessageProps) => props.variant !== 'note' && '10px'};
  margin-top: ${(props: { theme: DefaultTheme } & MessageProps) =>
    props.variant !== 'note' && props.theme.spacing.s};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black90};
  white-space: pre-line;
  margin-left: ${(props: MessageProps) => (props.alignRight ? 'auto' : '0')};
`;

export const $Actions = styled.div`
  padding: 0 ${({ theme }: { theme: DefaultTheme }) => theme.spacing.s};
  margin: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs} 0;
`;

export const $Notification = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs2};
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSize.body.s};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.alert};
`;

export const $FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $Hr = styled.hr`
  border: none;
  border-top: 1px solid
    ${(props: { theme: DefaultTheme }) => props.theme.colors.black20};
  margin: 0;
  width: 100%;
`;

export const $Empty = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black20};
  p {
    color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black50};
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fontSize.body.l};
    margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xs2};
  }
  svg {
    width: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xl5};
    height: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xl5};
  }
`;
