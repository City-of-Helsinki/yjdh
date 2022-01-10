import { Message, MessageData } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

export const mapMessages = (data: MessageData[] | undefined): Message[] =>
  data?.map(
    (message: MessageData): Message =>
      camelcaseKeys({
        ...message,
        createdAt: convertToUIDateAndTimeFormat(message.created_at),
        modifiedAt: convertToUIDateAndTimeFormat(message.modified_at),
      })
  ) || [];
