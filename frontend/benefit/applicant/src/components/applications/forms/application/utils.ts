import { Application } from 'benefit-shared/types/application';
import { FormikErrors, FormikTouched } from 'formik';

type SimpleObjectNode =
  | SimpleObject
  | Array<SimpleObjectNode>
  | string
  | number
  | boolean
  | null;
type SimpleObject = { [prop: string]: SimpleObjectNode };

const isSimpleObject = (a: SimpleObjectNode): a is SimpleObject =>
  typeof a === 'object' && a !== null && !Array.isArray(a);

const flattenObject = (
  obj: SimpleObject,
  parentKey = '',
  result: { [prop: string]: Exclude<SimpleObjectNode, SimpleObject> } = {}
): SimpleObjectNode => {
  const appendResult = result;
  Object.keys(obj).forEach((key) => {
    const newKey = `${parentKey}${parentKey ? '.' : ''}${key}`;
    const item = obj[key];
    if (isSimpleObject(item)) {
      flattenObject(item, newKey, result);
    } else {
      appendResult[newKey] = item;
    }
  });
  return result;
};

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
  Object.keys(flattenObject(touched)).filter((field) =>
    Object.keys(flattenObject(errors)).find((errorField) =>
      errorField.includes(field)
    )
  );
