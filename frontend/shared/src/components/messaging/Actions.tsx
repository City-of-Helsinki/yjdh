import { Button, TextArea } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useTheme } from 'styled-components';

import { $Actions, $FormActions, $Notification } from './Messaging.sc';

interface ActionProps {
  customItems?: React.ReactNode;
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
  const theme = useTheme();
  const componentId = 'MessagesForm_Message';
  const [messageValue, setMessageValue] = React.useState<string>('');
  const isValid = messageValue.length <= maxLength;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void =>
    setMessageValue(event.target.value);

  const handleSend = (): void => {
    onSend(messageValue);
    setMessageValue('');
  };

  return (
    <>
      {notification && <$Notification>{notification}</$Notification>}
      <$Actions>
        <TextArea
          disabled={!canWriteNewMessages}
          id={componentId}
          css={`
            margin-bottom: ${theme.spacing.s};
          `}
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
          {customItems}
          <Button
            type="submit"
            theme="coat"
            size="small"
            disabled={!messageValue || !isValid || !canWriteNewMessages}
            onClick={handleSend}
          >
            {sendText}
          </Button>
        </$FormActions>
      </$Actions>
    </>
  );
};

export default Actions;
