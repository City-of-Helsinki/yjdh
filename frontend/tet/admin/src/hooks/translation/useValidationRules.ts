import { useTranslation } from 'next-i18next';
import { EMAIL_REGEX, NAMES_REGEX, PHONE_NUMBER_REGEX } from 'shared/constants';

const useValidationRules = () => {
  const { t } = useTranslation();
  const maxMessage = t('common:editor.posting.validation.max');
  const requiredMessage = t('common:editor.posting.validation.max');

  return {
    required: {
      value: true,
      message: requiredMessage,
    },
    maxLength: {
      message: t('common:editor.posting.validation.max'),
    },
    email: {
      maxLength: {
        value: 254,
        message: maxMessage,
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
  };
};

export default useValidationRules;
