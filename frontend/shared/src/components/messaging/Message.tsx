import React from 'react';

import {
  $Date,
  $Message,
  $MessageContainer,
  $Meta,
  $Sender,
} from './Messaging.sc';

export interface MessageProps {
  sender: string;
  date: string;
  text: string;
  isPrimary?: boolean;
}

const Message: React.FC<MessageProps> = ({ sender, date, text, isPrimary }) => (
  <$MessageContainer>
    <$Meta>
      <$Sender>{sender}</$Sender>
      <$Date>{date}</$Date>
    </$Meta>
    <$Message isPrimary={isPrimary}>{text}</$Message>
  </$MessageContainer>
);

export default Message;
