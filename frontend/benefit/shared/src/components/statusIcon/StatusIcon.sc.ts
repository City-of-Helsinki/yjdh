import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import styled from 'styled-components';

export const $StatusIcon = styled.span`
  display: inline-block;

  svg {
    vertical-align: middle;
  }

  &.status-icon--${APPLICATION_STATUSES.HANDLING} {
    svg {
      color: ${(props) => props.theme.colors.info};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.ACCEPTED} {
    svg {
      color: ${(props) => props.theme.colors.success};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.REJECTED},
    &.status-icon--${APPLICATION_STATUSES.CANCELLED} {
    svg {
      color: ${(props) => props.theme.colors.error};
    }
  }

  &.status-icon--${APPLICATION_STATUSES.INFO_REQUIRED} {
    color: ${(props) => props.theme.colors.alertDark};
  }
`;
