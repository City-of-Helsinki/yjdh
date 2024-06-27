import { Button, TextArea } from 'hds-react';
import React from 'react';

import { $Actions, $FormActions, $Notification } from './Messaging.sc';

interface ActionProps {
  customItems?: Array<React.ReactNode>;
  placeholder?: string;
  sendText: string;
  errorText: string;
  maxLength?: number;
  notification?: string;
  onSend: (message: string) => void;
  canWriteNewMessages?: boolean;
  disabledText?: string;
}

const Actions: React.FC<ActionProps> = ({
  customItems,
  placeholder,
  sendText,
  errorText,
  maxLength = 1024,
  notification,
  onSend,
  canWriteNewMessages = true,
  disabledText = '',
}) => {
  const componentId = 'MessagesForm_Message';
  const [messageValue, setMessageValue] = React.useState<string>('');
  const isValid = messageValue.length <= maxLength;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void =>
    setMessageValue(event.target.value);

  const handleSend = (): void => {
    onSend(messageValue);
    setMessageValue('');
  };

  const showAllActionsOnOneLine = customItems?.length < 2;

  return (
    <>
      {notification && <$Notification>{notification}</$Notification>}
      <$Actions>
        <TextArea
          disabled={!canWriteNewMessages}
          id={componentId}
          name={componentId}
          placeholder={placeholder}
          onChange={handleChange}
          value={messageValue}
          invalid={!isValid}
          aria-invalid={!isValid}
          required={canWriteNewMessages}
          hideLabel={canWriteNewMessages && disabledText.length === 0}
          label={canWriteNewMessages ? placeholder : disabledText}
          errorText={isValid ? '' : errorText}
        />
        <$FormActions>
          {showAllActionsOnOneLine && customItems}
          <Button
            type="submit"
            theme="coat"
            size="small"
            disabled={!messageValue || !isValid || !canWriteNewMessages}
            onClick={handleSend}
            css="margin-left: auto"
          >
            {sendText}
          </Button>
        </$FormActions>
        {!showAllActionsOnOneLine && <$FormActions>{customItems}</$FormActions>}
      </$Actions>
    </>
  );
};

export default Actions;
