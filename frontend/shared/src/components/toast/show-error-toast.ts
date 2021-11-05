import Toast from 'shared/components/toast/Toast';

const showErrorToast = (title: string, message: string): void =>
  void Toast({
    autoDismissTime: 5000,
    type: 'error',
    labelText: title,
    text: message,
  });

export default showErrorToast;
