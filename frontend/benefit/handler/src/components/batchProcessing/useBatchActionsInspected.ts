import useBatchInspected from 'benefit/handler/hooks/useBatchInspected';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import parse from 'date-fns/parse';
import { FormikProps, useFormik } from 'formik';
import { TFunction, useTranslation } from 'next-i18next';
import { date, object, string } from 'yup';

export interface BatchCompletionFormValues {
  decision_maker_name: string;
  decision_maker_title: string;
  section_of_the_law: string;
  decision_date: Date | string | (readonly string[] & string);
  expert_inspector_name: string;
  expert_inspector_title: string;
  p2p_inspector_name: string;
  p2p_inspector_email: string;
  p2p_checker_name: string;
}

interface ApplicationListProps {
  t: TFunction;
  formik: FormikProps<BatchCompletionFormValues>;
  yearFromNow: Date;
  isSuccess: boolean;
  isError: boolean;
}

const useBatchActionsInspected = (
  id: string,
  proposalForDecision: PROPOSALS_FOR_DECISION,
  setBatchCloseAnimation?: React.Dispatch<React.SetStateAction<boolean>>
): ApplicationListProps => {
  const { t } = useTranslation();
  const {
    isSuccess,
    isError,
    mutate: completeBatch,
  } = useBatchInspected(setBatchCloseAnimation);

  const parseLocalizedDateString = (
    _: string,
    dateString: string
  ): Date | boolean => {
    const parsed = parse(dateString, 'd.M.yyyy', new Date());
    if (isValid(parsed)) {
      return new Date(format(parsed, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }
    return undefined;
  };

  const translations = {
    required: t('common:form.validation.required'),
    invalidName: t('common:form.validation.name.invalid'),
    sectionOfTheLaw: t('common:batches.form.errors.section_of_the_law'),
  };

  const now = new Date();
  const years = {
    currentYear: now.getFullYear(),
    min: addMonths(now, -3),
    max: addMonths(now, 3),
  };
  const requiredSchema = {
    fullName: string()
      .matches(/^(.*)\s(\w+)/, translations.invalidName)
      .required(translations.required),
    sectionOfTheLaw: string()
      .matches(/^§\d+$/, translations.sectionOfTheLaw)
      .required(translations.required),
    finnishDate: date()
      .min(
        years.min,
        t('common:form.validation.date.min', {
          min: String('-3 kk'),
        })
      )
      .max(
        years.max,
        t('common:form.validation.date.max', {
          max: String('+ 3 kk'),
        })
      )
      .transform(parseLocalizedDateString)
      .required(t('common:form.validation.date.format')),
    anyString: string().required(translations.required),
    email: string()
      .required(translations.required)
      .email(t('common:form.validation.email.invalid')),
  };

  const schemaRejected = object({
    decision_maker_name: requiredSchema.fullName,
    decision_maker_title: requiredSchema.anyString,
    section_of_the_law: requiredSchema.sectionOfTheLaw,
    decision_date: requiredSchema.finnishDate,
    expert_inspector_name: requiredSchema.fullName,
    expert_inspector_title: requiredSchema.anyString,
  });

  const schemaAccepted = object({
    decision_maker_name: requiredSchema.fullName,
    decision_maker_title: requiredSchema.anyString,
    section_of_the_law: requiredSchema.sectionOfTheLaw,
    decision_date: requiredSchema.finnishDate,
    expert_inspector_name: requiredSchema.fullName,
    expert_inspector_title: requiredSchema.anyString,
    p2p_inspector_name: requiredSchema.anyString,
    p2p_inspector_email: requiredSchema.email,
    p2p_checker_name: requiredSchema.anyString,
  });

  const markBatchAs = (
    status: BATCH_STATUSES,
    form?: BatchCompletionFormValues
  ): void =>
    completeBatch({
      id,
      status,
      form,
    });

  const formOptions = {
    initialValues: {
      decision_maker_name: '',
      decision_maker_title: '',
      section_of_the_law: '§',
      decision_date: format(new Date(), 'd.M.yyyy'),
      expert_inspector_name: '',
      expert_inspector_title: '',
      p2p_inspector_name: '',
      p2p_inspector_email: '',
      p2p_checker_name: '',
    },
    validationSchema:
      proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
        ? schemaAccepted
        : schemaRejected,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values: BatchCompletionFormValues): void =>
      markBatchAs(
        proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
          ? BATCH_STATUSES.DECIDED_ACCEPTED
          : BATCH_STATUSES.DECIDED_REJECTED,
        values
      ),
  };
  const formik = useFormik<BatchCompletionFormValues>(formOptions);

  return {
    t,
    formik,
    yearFromNow: years.min,
    isSuccess,
    isError,
  };
};

export { useBatchActionsInspected };