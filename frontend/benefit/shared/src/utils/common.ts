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

/**
 * Used to prevent SSR-rendered unstyled HTML-elements from popping when performing page load
 */
export const setAppLoaded = (): void => {
  if (typeof window !== 'undefined') {
    const loader = document.querySelector('#app-loader');
    if (loader) {
      loader.classList.remove('app-waits-for-client');
    }
  }
};

export const isTruthy = (value: string | boolean): boolean =>
  ['1', true, 'true'].includes(value);
