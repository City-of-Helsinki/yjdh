import React from 'react';

import Actions from './Actions';
import Message from './Message';

interface MessageData {
  sender: string;
  date: string;
  text: string;
}

export interface MessagesFormProps {
  messages: MessageData[];
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const MessagesForm: React.FC<MessagesFormProps> = ({
  messages,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit}>
    {messages.map((message) => (
      <Message
        key={message.sender}
        sender={message.sender}
        date={message.date}
        text={message.text}
      />
    ))}
    <Actions />
  </form>
);

export default MessagesForm;
