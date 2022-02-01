import { CALCULATION_EMPLOYMENT_KEYS } from 'benefit/handler/constants';
import { CalculationCommon } from 'benefit/handler/types/application';
import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import { TFunction } from 'next-i18next';
import * as Yup from 'yup';

export const getValidationSchema = (
  t: TFunction
): Yup.SchemaOf<CalculationCommon> =>
  Yup.object().shape({
    [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
    [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .required(t(VALIDATION_MESSAGE_KEYS.REQUIRED)),
  });
