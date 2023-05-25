import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import styled from 'styled-components';

type StatusProps = {
  status: APPLICATION_STATUSES;
};

export const $Heading = styled.h1`
  font-weight: 400;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
`;

export const $ArchiveCount = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
`;

export const $Status = styled.p<StatusProps>`
  color: ${(props) =>
    props.status === APPLICATION_STATUSES.CANCELLED
      ? props.theme.colors.error
      : props.theme.colors.black};
`;

export const $Empty = styled.div`
  background-color: ${(props) => props.theme.colors.black5};
  color: ${(props) => props.theme.colors.black50};
  padding: ${(props) => props.theme.spacing.s};
`;
