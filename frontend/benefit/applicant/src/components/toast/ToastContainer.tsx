import React from 'react';
import { ToastContainer } from 'react-toastify';

export const HDSToastContainerId = 'HDSToastContainer';

const HDSToastContainer: React.FC = () => {
  return (
    <ToastContainer
      closeButton={false}
      autoClose={false}
      hideProgressBar={true}
      closeOnClick={false}
      draggable={false}
      containerId={HDSToastContainerId}
      enableMultiContainer={true}
    />
  );
};

export default HDSToastContainer;
