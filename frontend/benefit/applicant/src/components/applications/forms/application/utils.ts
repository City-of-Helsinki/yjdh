import { Application } from 'benefit-shared/types/application';
import { FormikErrors, FormikTouched } from 'formik';

type FlattenedObject = Record<string, string>;

function flattenObject(
  obj: FlattenedObject,
  parentKey = '',
  result: FlattenedObject = {}
): FlattenedObject {
  const appendResult = result;
  Object.keys(obj).forEach((key) => {
    const newKey = `${parentKey}${parentKey ? '.' : ''}${key}`;
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key] as unknown as FlattenedObject, newKey, result);
    } else {
      appendResult[newKey] = obj[key];
    }
  });
  return result;
}

/**
 * Used to enable / disable "save and close" button.
 * Flatten Formik's error and touched fields to compare touched substring against error fields.
 * Error fields are more verbose than touched fields, including min, max etc. validation data
 * for the whole nested data set, for example, company or employee. Touch fields only consist
 * of single fields that are touched. Thus substring is used to match touched fields against error fields.
 * */
export const findIntersectionOfTouchedAndErroredFields = (
  touched: FormikTouched<Partial<Application>>,
  errors: FormikErrors<Partial<Application>>
): string[] =>
  Object.keys(flattenObject(touched as FlattenedObject)).filter((field) =>
    Object.keys(flattenObject(errors as FlattenedObject)).some((errorField) =>
      errorField.includes(field)
    )
  );
