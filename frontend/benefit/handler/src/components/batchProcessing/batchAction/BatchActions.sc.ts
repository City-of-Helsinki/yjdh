import styled from 'styled-components';

type TooltipProps = {
  disabled: boolean;
};

export const $TooltipWrapper = styled.div<TooltipProps>`
  opacity: ${(props: TooltipProps) => (props.disabled ? '0.3' : '1')};
  pointer-events: ${(props: TooltipProps) => (props.disabled ? 'none' : 'all')};

  label {
    display: inline-flex;
    align-items: center;

    span {
      margin-right: var(--spacing-xs);
    }
  }
`;
