import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ThemeProps } from 'shared/styles/theme';
import styled from 'styled-components';

export const $StatusIcon = styled.span`
  display: inline-block;

  svg {
    vertical-align: middle;
  }

  &.status-icon--${APPLICATION_STATUSES.HANDLING} {
    svg {
      color: ${(props: ThemeProps) => props.theme.colors.info};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.ACCEPTED} {
    svg {
      color: ${(props: ThemeProps) => props.theme.colors.success};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.REJECTED},
    &.status-icon--${APPLICATION_STATUSES.CANCELLED} {
    svg {
      color: ${(props: ThemeProps) => props.theme.colors.error};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.INFO_REQUIRED} {
    color: ${(props: ThemeProps) => props.theme.colors.alertDark};
  }
`;
