import React from 'react';
import { MessageVariant } from 'shared/types/messages';

import {
  $Date,
  $Hr,
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
  variant: MessageVariant;
}

const Message: React.FC<MessageProps> = ({
  sender,
  date,
  text,
  isPrimary,
  variant,
}) => (
  <$MessageContainer>
    <$Meta>
      <$Sender>{sender}</$Sender>
      <$Date>{date}</$Date>
    </$Meta>
    <$Message isPrimary={isPrimary} variant={variant}>
      {text}
    </$Message>
    {variant === 'note' && <$Hr />}
  </$MessageContainer>
);

export default Message;
