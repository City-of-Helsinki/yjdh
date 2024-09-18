import Toast from 'shared/components/toast/Toast';

const showErrorToast = (
  title: string,
  message: string | JSX.Element | Array<string | JSX.Element>,
  autoDismissTime = 5000
): void =>
  void Toast({
    autoDismissTime,
    type: 'error',
    labelText: title,
    text: message,
  });

export default showErrorToast;
