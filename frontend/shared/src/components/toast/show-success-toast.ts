import Toast from 'shared/components/toast/Toast';

const showSuccessToast = (title: string, message: string): void =>
  void Toast({
    autoDismissTime: 5000,
    type: 'success',
    labelText: title,
    text: message,
  });

export default showSuccessToast;
