import Toast from 'shared/components/toast/Toast';

const showErrorToast = (title: string, message: string): void =>
  void Toast({
    autoDismiss: true,
    autoDismissTime: 5000,
    type: 'error',
    translated: true,
    labelText: title,
    text: message,
  });

export default showErrorToast;
