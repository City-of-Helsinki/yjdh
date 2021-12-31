import React from 'react';
import { $Message, $Meta, $Sender, $Date } from './Messaging.sc';

export interface MessageProps {
  sender: string;
  date: string;
  text: string;
}

const Message = ({ sender, date, text }: MessageProps) => {
  return (
    <div>
      <$Meta>
        <$Sender>{sender}</$Sender>
        <$Date>{date}</$Date>
      </$Meta>
      <$Message>{text}</$Message>
    </div>
  );
};

export default Message;
