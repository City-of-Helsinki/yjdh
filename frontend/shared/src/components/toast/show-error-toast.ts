import Toast from 'shared/components/toast/Toast';

const showErrorToast = (
  title: string,
  message: string,
  autoDismissTime = 5000
): void =>
  void Toast({
    autoDismissTime,
    type: 'error',
    labelText: title,
    text: message,
  });

export default showErrorToast;
