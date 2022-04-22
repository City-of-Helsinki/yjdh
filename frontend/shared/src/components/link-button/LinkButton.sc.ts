import { Button } from 'hds-react';
import alignCenterSvg from 'shared/styles/svg/align-center-svg.sc';
import styled from 'styled-components';

const $LinkButton = styled(Button)`
  &&& {
    background: none;
    align-items: normal;
    padding: 0;
    position: relative;
    left: -10px;
  }
  & > span {
    padding: 0;
    line-height: 0.9em;
    margin: 0;
  }
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  ${alignCenterSvg}
`;
export default $LinkButton;
