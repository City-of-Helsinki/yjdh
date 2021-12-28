import { MESSAGE_TYPES } from '../constants';

export type MessageData = {
  id: string;
  created_at: string;
  modified_at: string;
  content: string;
  message_type: MESSAGE_TYPES;
};

export type Message = {
  id: string;
  createdAt: string;
  modifiedAt: string;
  content: string;
  messageType: MESSAGE_TYPES;
};
