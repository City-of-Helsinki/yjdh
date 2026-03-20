import styled, { DefaultTheme } from 'styled-components';

export const $Heading = styled.h2`
  margin-top: var(--spacing-xl);
`;

export const $Empty = styled.div`
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.black5};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black50};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $EmptyHeading = styled.h2`
  font-weight: 400;
`;

export const $ActionMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 8px;
`;

type TagWrapperProps = {
  $colors: {
    background: string;
    text: string;
  };
  theme: DefaultTheme;
};

export const $TagWrapper = styled.div<TagWrapperProps>`
  #hds-tag {
    background: ${(props: TagWrapperProps) => props.$colors.background};
    color: ${(props: TagWrapperProps) => props.$colors.text};

    #hds-tag-label span {
      display: flex;
      align-items: center;
      svg {
        margin-right: 2px;
      }
    }
  }
`;

export const $UnreadMessagesCount = styled.div`
  position: absolute;
  text-align: center;
  width: 18px;
  height: 18px;
  line-height: 18px;
  top: -5px;
  right: -11px;
  border-radius: 50%;
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.s};
  font-weight: 300;
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.white};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArms};
`;

interface $AlterationBadgeProps {
  $requiresAttention?: boolean;
  theme: DefaultTheme;
}
export const $AlterationBadge = styled.div<$AlterationBadgeProps>`
  background: ${(props: $AlterationBadgeProps) =>
    props.$requiresAttention
      ? props.theme.colors.coatOfArms
      : props.theme.colors.black40};
  color: ${({ theme }: $AlterationBadgeProps) => theme.colors.white};
  font-size: 14px;
  line-height: 1;
  width: 14px;
  height: 14px;
  text-align: center;
  padding: 0.3rem 0.35rem;
  border-radius: 50%;
`;

export const $ApplicationList = styled.div``;

export const $InstalmentList = styled.div`
  [class*='actionButtonContainer'] {
    button {
      display: none;
    }
  }
`;

type $ActionErrorsProps = {
  $errorText: string;
  theme: DefaultTheme;
};

export const $ActionErrors = styled.div<$ActionErrorsProps>`
  &:not(:first-child) {
    margin-left: 20px;
    border-left: 2px solid
      ${({ theme }: $ActionErrorsProps) => theme.colors.black10};
    padding-left: 8px;
  }
  .custom-tooltip-error {
    display: flex;
    align-items: center;
    flex-flow: column;

    button:focus {
      box-shadow: 0 0 0 var(--button-focus-outline-width)
        ${({ theme }: $ActionErrorsProps) => theme.colors.error};
    }

    // Override HDS Tooltip styles
    section {
      background-color: ${({ theme }: $ActionErrorsProps) =>
        theme.colors.errorLight};
      &[data-popper-placement='top'] {
        border-bottom: 8px solid
          ${({ theme }: $ActionErrorsProps) => theme.colors.error};
        > div[class]:last-child {
          border-top-color: ${({ theme }: $ActionErrorsProps) =>
            theme.colors.error};
        }
      }
      &[data-popper-placement='bottom'] {
        border-top: 8px solid
          ${({ theme }: $ActionErrorsProps) => theme.colors.error};
        > div[class]:last-child {
          border-bottom-color: ${({ theme }: $ActionErrorsProps) =>
            theme.colors.error};
        }
      }
    }

    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &:after {
      display: block;
      line-height: 1.05;
      content: '${({ $errorText }: $ActionErrorsProps) => $errorText}';
      text-align: center;
      font-size: 12px;
      color: ${({ theme }: $ActionErrorsProps) => theme.colors.error};
    }

    svg {
      color: ${({ theme }: $ActionErrorsProps) => theme.colors.error};
    }
  }
`;

export const $TableActions = styled.div`
  display: flex;
  align-items: center;
`;
