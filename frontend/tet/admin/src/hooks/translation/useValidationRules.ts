import { useTranslation } from 'next-i18next';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX, DATE_UI_REGEX } from 'shared/constants';

const useValidationRules = () => {
  const { t } = useTranslation();
  const maxMessage = t('common:editor.posting.validation.max');
  const requiredMessage = t('common:editor.posting.validation.required');
  const correctName = t('common:editor.posting.validation.name');

  return {
    required: {
      value: true,
      message: requiredMessage,
    },
    date: {
      pattern: {
        value: DATE_UI_REGEX,
        message: t('common:editor.posting.validation.phone'),
      },
    },
    maxLength: {
      message: t('common:editor.posting.validation.max'),
    },
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
    phone: {
      maxLength: {
        value: 64,
        message: `${maxMessage} [64]`,
      },
      pattern: {
        value: PHONE_NUMBER_REGEX,
        message: t('common:editor.posting.validation.phone'),
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
  };
};

export default useValidationRules;
