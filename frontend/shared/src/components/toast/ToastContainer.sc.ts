import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';

export const $ToastContainer = styled(ToastContainer).attrs({
  className: 'toast-container',
  toastClassName: 'toast',
  bodyClassName: 'body',
  progressClassName: 'progress',
})`
  .close-button {
    display: none;
  }

  .toast {
    align-items: center;
    display: flex;
    justify-content: center;
    left: 0;
    margin: 0 auto;
    position: fixed;
    padding: 0;
    right: 0;
    top: 0;
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
