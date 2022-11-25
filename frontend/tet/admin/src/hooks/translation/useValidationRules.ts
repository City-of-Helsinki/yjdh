import { useTranslation } from 'next-i18next';
import { RegisterOptions } from 'react-hook-form';
import { DATE_UI_REGEX, EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX, WEBSITE_URL } from 'shared/constants';

const useValidationRules = (): RegisterOptions & Record<string, RegisterOptions> => {
  const { t } = useTranslation();
  const maxMessage = t('common:editor.posting.validation.max');
  const requiredMessage = t('common:editor.posting.validation.required');
  const correctName = t('common:editor.posting.validation.name');
  const phoneMessage = t('common:editor.posting.validation.phone');

  return {
    required: {
      value: true,
      message: requiredMessage,
    },
    date: {
      pattern: {
        value: DATE_UI_REGEX,
        message: phoneMessage,
      },
    },
    maxlength: t('common:editor.posting.validation.max'),
    name: {
      required: {
        value: true,
        message: requiredMessage,
      },
      pattern: {
        value: NAMES_REGEX,
        message: correctName,
      },
      maxLength: {
        value: 128,
        message: `${maxMessage} [128]`,
      },
    },
    notRequiredName: {
      pattern: {
        value: NAMES_REGEX,
        message: correctName,
      },
      maxLength: {
        value: 128,
        message: `${maxMessage} [128]`,
      },
    },
    phone: {
      maxLength: {
        value: 64,
        message: `${maxMessage} [64]`,
      },
      pattern: {
        value: PHONE_NUMBER_REGEX,
        message: phoneMessage,
      },
      required: {
        value: true,
        message: requiredMessage,
      },
    },
    email: {
      maxLength: {
        value: 254,
        message: `${maxMessage} [254]`,
      },
      pattern: {
        value: EMAIL_REGEX,
        message: t('common:editor.posting.validation.email'),
      },
      required: {
        value: true,
        message: requiredMessage,
      },
    },
    description: {
      maxLength: {
        value: 2000,
        message: `${maxMessage} [2000]`,
      },
      required: {
        value: true,
        message: requiredMessage,
      },
    },
    website: {
      pattern: {
        value: WEBSITE_URL,
        message: phoneMessage,
      },
      maxLength: {
        value: 2048,
        message: `${maxMessage} [2048]`,
      },
    },
  };
};

export default useValidationRules;
