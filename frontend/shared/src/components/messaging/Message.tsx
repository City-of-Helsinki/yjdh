import React from 'react';

import { $Date, $Message, $Meta, $Sender } from './Messaging.sc';

export interface MessageProps {
  sender: string;
  date: string;
  text: string;
}

const Message: React.FC<MessageProps> = ({ sender, date, text }) => (
  <div>
    <$Meta>
      <$Sender>{sender}</$Sender>
      <$Date>{date}</$Date>
    </$Meta>
    <$Message>{text}</$Message>
  </div>
);

export default Message;
