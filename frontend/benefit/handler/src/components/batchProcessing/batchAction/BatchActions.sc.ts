import styled from 'styled-components';

type TooltipProps = {
  disabled: boolean;
};

export const $TooltipWrapper = styled.div<TooltipProps>`
  opacity: ${(props) => (!props.disabled ? '1' : '0.3')};
  pointer-events: ${(props) => (!props.disabled ? 'all' : 'none')};

  label {
    display: inline-flex;
    align-items: center;

    span {
      margin-right: var(--spacing-xs);
    }
  }
`;
