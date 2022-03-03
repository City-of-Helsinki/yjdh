import { useContext } from 'react';
import DialogContext, {
  DialogActionKind,
  DialogState,
} from 'shared/contexts/DialogContext';

type ResolverCallback = (a: boolean) => void;

type ConfirmArgs = {
  header: string;
  submitButtonLabel: string;
  content?: string | undefined;
};

type ReturnType = {
  confirm: ({
    header,
    submitButtonLabel,
    content,
  }: ConfirmArgs) => Promise<unknown>;
  onConfirm: () => void;
  onCancel: () => void;
  confirmState: DialogState;
};

let resolveCallback: ResolverCallback;
const useConfirm = (): ReturnType => {
  const [confirmState, dispatch] = useContext(DialogContext);

  const closeConfirm = (): void => {
    dispatch({
      type: DialogActionKind.HIDE_CONFIRM,
    });
  };

  const onConfirm = (): void => {
    closeConfirm();
    resolveCallback(true);
  };

  const onCancel = (): void => {
    closeConfirm();
    resolveCallback(false);
  };
  const confirm = ({
    header,
    submitButtonLabel,
    content,
  }: ConfirmArgs): Promise<unknown> => {
    dispatch({
      type: DialogActionKind.SHOW_CONFIRM,
      payload: {
        header,
        submitButtonLabel,
        content,
      },
    });
    return new Promise((resolve) => {
      resolveCallback = resolve;
    });
  };

  return { confirm, onConfirm, onCancel, confirmState };
};

export default useConfirm;
