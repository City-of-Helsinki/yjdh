import { Message, MessageData } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

export const getApplicationStepFromString = (step: string): number => {
  try {
    return parseInt(step.split('_')[1], 10);
  } catch (error) {
    return 1;
  }
};

export const getApplicationStepString = (step: number): string =>
  `step_${step}`;

export const mapMessages = (data: MessageData[] | undefined): Message[] =>
  data?.map(
    (message: MessageData): Message =>
      camelcaseKeys({
        ...message,
        createdAt: convertToUIDateAndTimeFormat(message.created_at),
        modifiedAt: convertToUIDateAndTimeFormat(message.modified_at),
      })
  ) || [];
