import React from 'react';
import Toast from 'shared/components/toast/Toast';

const showErrorToast = (
  title: string,
  message: React.ReactNode,
  autoDismissTime = 5000
): void =>
  void Toast({
    autoDismissTime,
    type: 'error',
    labelText: title,
    text: message,
  });

export default showErrorToast;
