import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Tag } from 'hds-react';
import styled from 'styled-components';

import { statusColorMap } from './utils';

type StatusLabelProps = {
  status?: APPLICATION_STATUSES;
};

export const $StatusLabel = styled(Tag)<StatusLabelProps>`
  background-color: ${(props) =>
    props.theme.colors[statusColorMap(props.status)]};
`;
