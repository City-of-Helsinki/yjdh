import React, { useReducer } from 'react';

export const SHOW_CONFIRM = 'SHOW_CONFIRM';
export const HIDE_CONFIRM = 'HIDE_CONFIRM';

type DialogState = {
  show: boolean;
  header: string;
  content?: string;
};

export enum DialogActionKind {
  SHOW_CONFIRM = 'SHOW_CONFIRM',
  HIDE_CONFIRM = 'HIDE_CONFIRM',
}

export type DialogAction = {
  type: DialogActionKind;
  payload: DialogState;
};

type DialogPayload = {
  header: string;
  content?: string;
};

type ShowConfirmAction = {
  type: DialogActionKind.SHOW_CONFIRM;
  payload: DialogPayload;
};

type HideConfirmAction = {
  type: DialogActionKind.HIDE_CONFIRM;
  payload?: DialogPayload;
};

type DialogActionTypes = ShowConfirmAction | HideConfirmAction;

const initialState: DialogState = {
  show: false,
  header: '',
  content: '',
};

const reducer = (state: DialogState = initialState, action: DialogActionTypes) => {
  const content = action?.payload?.content ? action.payload.content : '';
  switch (action.type) {
    case SHOW_CONFIRM:
      return {
        show: true,
        header: action.payload.header,
        content: content,
      };
    case HIDE_CONFIRM:
      return initialState;
    default:
      return initialState;
  }
};

const DialogContext = React.createContext<[DialogState, React.Dispatch<DialogActionTypes>]>([
  { show: false, header: '', content: '' },
  () => {},
]);

export const DialogContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <DialogContext.Provider value={[state, dispatch]}>{children}</DialogContext.Provider>;
};

export default DialogContext;
