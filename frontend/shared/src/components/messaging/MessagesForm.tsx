import { Button, TextArea } from 'hds-react';
import React from 'react';
import Message from './Message';
import Actions from './Actions';

interface Message {
  sender: string;
  date: string;
  text: string;
}

export interface MessagesFormProps {
  messages: Message[];
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const MessagesForm = ({ messages, handleSubmit }: MessagesFormProps) => {
  return (
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
};

export default MessagesForm;
