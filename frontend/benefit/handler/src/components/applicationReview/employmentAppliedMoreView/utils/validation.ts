import { CALCULATION_EMPLOYMENT_KEYS } from 'benefit/handler/constants';
import { CalculationCommon } from 'benefit/handler/types/application';
import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import * as Yup from 'yup';

export const getValidationSchema = (): Yup.SchemaOf<CalculationCommon> =>
  Yup.object().shape({
    [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: Yup.string().typeError(
      VALIDATION_MESSAGE_KEYS.DATE_FORMAT
    ),
    [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: Yup.string().typeError(
      VALIDATION_MESSAGE_KEYS.DATE_FORMAT
    ),
  });
