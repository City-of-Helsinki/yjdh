import { Notification } from 'hds-react';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';

export const $ToastContainer = styled(ToastContainer).attrs({
  className: 'toast-container',
  toastClassName: 'toast',
  bodyClassName: 'body',
  progressClassName: 'progress',
})`
  width: unset;

  .close-button {
    display: none;
  }

  .toast {
    align-items: center;
    display: flex;
    justify-content: center;
    left: 0;
    margin: 0 auto;
    padding: 0;
    width: 100%;
    z-index: 1;
  }

  .Toastify__toast--default {
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
`;

export const $Notification = styled(Notification)`
  min-width: ${(props) => props.theme.containerWidth.s};
`;
