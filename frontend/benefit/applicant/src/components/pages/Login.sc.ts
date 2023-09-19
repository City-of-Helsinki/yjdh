import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $LoginGrid = styled($Grid)`
  max-width: 486px;
  h1 {
    font-size: var(--fontsize-heading-l);

    ${respondAbove('xs')`
    font-weight: 400;

      font-size: var(--fontsize-heading-xl-mobile);
    `}

    ${respondAbove('sm')`
      font-size: var(--fontsize-heading-xl);
    `}
  }

  p {
    font-size: 1.15em;
  }
`;
