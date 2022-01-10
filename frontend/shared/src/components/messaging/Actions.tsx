import { Button, TextArea } from 'hds-react';
import React from 'react';
import { useTheme } from 'styled-components';
import { $Actions, $FormActions } from './Messaging.sc';

interface ActionProps {
  customItems?: React.ReactNode;
  placeholder?: string;
  sendText: string;
  errorText: string;
  maxLength?: number;
}

const Actions: React.FC<ActionProps> = ({
  customItems,
  placeholder,
  sendText,
  errorText,
  maxLength = 2,
}) => {
  const theme = useTheme();
  const componentId = 'MessagesForm_Message';
  const [messageValue, setMessageValue] = React.useState<string>('');
  const isValid = messageValue.length <= maxLength;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessageValue(event.target.value);

  return (
    <$Actions>
      <TextArea
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
        errorText={isValid ? '' : errorText}
      />
      <$FormActions>
        {customItems}
        <Button
          type="submit"
          theme="coat"
          size="small"
          disabled={!messageValue || !isValid}
        >
          {sendText}
        </Button>
      </$FormActions>
    </$Actions>
  );
};

export default Actions;
