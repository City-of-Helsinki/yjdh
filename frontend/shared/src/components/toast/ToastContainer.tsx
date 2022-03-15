import React from 'react';

import { $ToastContainer } from './ToastContainer.sc';

export const HDSToastContainerId = 'HDSToastContainer';

const HDSToastContainer: React.FC = () => (
    <$ToastContainer
      closeButton={false}
      autoClose={false}
      hideProgressBar
      closeOnClick={false}
      draggable={false}
      containerId={HDSToastContainerId}
      enableMultiContainer
    />
  );

export default HDSToastContainer;
