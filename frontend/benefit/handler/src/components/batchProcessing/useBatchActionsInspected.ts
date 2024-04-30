import useBatchInspected from 'benefit/handler/hooks/useBatchInspected';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
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
  batch: BatchProposal,
  setBatchCloseAnimation?: React.Dispatch<React.SetStateAction<boolean>>
): ApplicationListProps => {
  const {
    applications,
    proposal_for_decision: proposalForDecision,
    id,
    decision_maker_name,
    decision_maker_title,
    expert_inspector_name,
    expert_inspector_title,
    section_of_the_law,
    decision_date,
    p2p_inspector_name,
    p2p_inspector_email,
    p2p_checker_name,
  } = batch;
  const { t } = useTranslation();
  const {
    isSuccess,
    isError,
    mutate: setBatchDecided,
  } = useBatchInspected(setBatchCloseAnimation, applications.length);

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
    inspectionMode: string().required(),
    decisionMakerFullName: string().when('inspection_mode', {
      is: 'ahjo',
      then: string()
        .matches(/^(.*)\s(\w+)/, translations.invalidName)
        .required(translations.required),
    }),
    decisionMakerAnyString: string().required(translations.required),
    ahjoFullName: string().when('inspection_mode', {
      is: 'ahjo',
      then: string()
        .matches(/^(.*)\s(\w+)/, translations.invalidName)
        .required(translations.required),
    }),
    ahjoAnyString: string().when('inspection_mode', {
      is: 'ahjo',
      then: string().required(translations.required),
    }),
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
    p2pAnyString: string().when('inspection_mode', {
      is: 'p2p',
      then: string().required(translations.required),
    }),
    p2pFullName: string().when('inspection_mode', {
      is: 'p2p',
      then: string()
        .matches(/^(.*)\s(\w+)/, translations.invalidName)
        .required(translations.required),
    }),
    email: string().when('inspection_mode', {
      is: 'p2p',
      then: string()
        .email(t('common:form.validation.email.invalid'))
        .required(translations.required),
    }),
  };

  const schemaRejected = object({
    decision_maker_name: requiredSchema.decisionMakerFullName,
    decision_maker_title: requiredSchema.decisionMakerAnyString,
    section_of_the_law: requiredSchema.sectionOfTheLaw,
    decision_date: requiredSchema.finnishDate,
  });

  const schemaAccepted = object({
    inspection_mode: requiredSchema.inspectionMode,
    decision_maker_name: requiredSchema.decisionMakerFullName,
    decision_maker_title: requiredSchema.decisionMakerAnyString,
    section_of_the_law: requiredSchema.sectionOfTheLaw,
    decision_date: requiredSchema.finnishDate,
    expert_inspector_name: requiredSchema.ahjoFullName,
    expert_inspector_title: requiredSchema.ahjoAnyString,
    p2p_inspector_name: requiredSchema.p2pFullName,
    p2p_inspector_email: requiredSchema.email,
    p2p_checker_name: requiredSchema.p2pAnyString,
  });

  const markBatchAs = (
    status: BATCH_STATUSES,
    form?: BatchCompletionFormValues
  ): void =>
    setBatchDecided({
      id,
      status,
      form,
    });

  console.log(decision_date);

  const formOptions = {
    initialValues: {
      inspection_mode: 'ahjo',
      decision_maker_name,
      decision_maker_title,
      expert_inspector_name,
      expert_inspector_title,
      section_of_the_law:
        section_of_the_law && section_of_the_law?.length > 0
          ? section_of_the_law
          : '§',
      decision_date:
        decision_date && decision_date?.length > 0
          ? format(parse(decision_date, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
          : format(new Date(), 'd.M.yyyy'),
      p2p_inspector_name,
      p2p_inspector_email,
      p2p_checker_name,
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
