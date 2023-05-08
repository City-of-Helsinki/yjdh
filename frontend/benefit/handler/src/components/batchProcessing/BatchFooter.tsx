import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useUserQuery from 'benefit/handler/hooks/useUserQuery';
import { getErrorText } from 'benefit/handler/utils/forms';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import parse from 'date-fns/parse';
import { useFormik } from 'formik';
import { Button, DateInput, IconArrowUndo, TextInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { date, object, string } from 'yup';

const parseLocalizedDateString = (_: string, dateString: string) => {
  const parsed = parse(dateString, 'd.M.yyyy', new Date());
  if (isValid(parsed)) {
    return new Date(format(parsed, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
  }
};

type BatchProps = {
  batch: BatchProposal;
};

const BatchFooterAhjo: React.FC<BatchProps> = ({ batch }: BatchProps) => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const { isSuccess, isError, mutate: changeBatchStatus } = useBatchStatus();

  useEffect(() => {
    if (isSuccess || isError) {
      setIsSubmitted(false);
    }
  }, [isSuccess, isError]);

  const markBatchAs = (markBatchAsStatus: BATCH_STATUSES): void =>
    changeBatchStatus({
      id: batch.id,
      status: markBatchAsStatus,
    });
  const translationRequired = t('common:form.validation.required');
  const translationInvalidName = t('common:form.validation.name.invalid');

  const stringRequired = string()
    .matches(/^(.*)\s(\w+)/, translationInvalidName)
    .required(translationRequired);

  const yearFromNow = new Date(new Date().getFullYear() - 1, 0, 1);
  const schema = object({
    decision_maker_name: stringRequired,
    decision_maker_title: string().required(translationRequired),
    section_of_the_law: string()
      .matches(/^§\d+$/, t('common:batches.form.errors.section_of_the_law'))
      .required(translationRequired),
    decision_date: date()
      .min(
        yearFromNow,
        t('common:form.validation.date.min', {
          min: String(new Date().getFullYear() - 1),
        })
      )
      .transform(parseLocalizedDateString)
      .required(t('common:form.validation.date.format')),
    expert_inspector_name: stringRequired,
    expert_inspector_title: string().required(translationRequired),
  });
  const formik = useFormik<any>({
    initialValues: {
      decision_maker_name: '',
      decision_maker_title: '',
      section_of_the_law: '§',
      decision_date: format(new Date(), 'd.M.yyyy'),
      expert_inspector_name: '',
      expert_inspector_title: '',
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: () =>
      markBatchAs(
        batch.proposal_for_decision === PROPOSALS_FOR_DECISION.ACCEPTED
          ? BATCH_STATUSES.DECIDED_ACCEPTED
          : BATCH_STATUSES.DECIDED_REJECTED
      ),
  });

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, true);

  const handleSubmit = (e): void => {
    e.preventDefault();
    void formik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        setIsSubmitted(true);
        return formik.submitForm();
      }
    });
  };
  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <$GridCell $colSpan={3}>
          <TextInput
            onChange={formik.handleChange}
            label="t Päättäjän nimi"
            id={`decision_maker_name_${batch.id}`}
            name="decision_maker_name"
            errorText={getErrorMessage('decision_maker_name')}
            invalid={!!formik.errors.decision_maker_name}
            value={formik.values.decision_maker_name ?? ''}
            required
          />
        </$GridCell>

        <$GridCell $colSpan={3}>
          <TextInput
            onChange={formik.handleChange}
            label="t Päättäjän titteli"
            id={`decision_maker_title${batch.id}`}
            name="decision_maker_title"
            errorText={getErrorMessage('decision_maker_title')}
            invalid={!!formik.errors.decision_maker_title}
            value={formik.values.decision_maker_title ?? ''}
            required
          />
        </$GridCell>

        <$GridCell $colSpan={2}>
          <TextInput
            onChange={formik.handleChange}
            label="t pykälä"
            id={`section_of_the_law${batch.id}`}
            name="section_of_the_law"
            errorText={getErrorMessage('section_of_the_law')}
            invalid={!!formik.errors.section_of_the_law}
            value={formik.values.section_of_the_law ?? ''}
            required
          />
        </$GridCell>

        <$GridCell $colSpan={3}>
          <DateInput
            minDate={yearFromNow}
            onChange={(value) => formik.setFieldValue('decision_date', value)}
            label="t Päätöksen päivämäärä"
            id={`decision_date${batch.id}`}
            name="decision_date"
            errorText={getErrorMessage('decision_date')}
            invalid={!!formik.errors.decision_date}
            value={formik.values.decision_date ?? ''}
            language="fi"
            required
          />
        </$GridCell>
      </FormSection>

      <FormSection>
        <$GridCell $colSpan={3}>
          <TextInput
            onChange={formik.handleChange}
            label="t Asiantarkastajan nimi"
            id={`expert_inspector_name${batch.id}`}
            name="expert_inspector_name"
            errorText={getErrorMessage('expert_inspector_name')}
            invalid={!!formik.errors.expert_inspector_name}
            value={formik.values.expert_inspector_name ?? ''}
            required
          />
        </$GridCell>

        <$GridCell $colSpan={3}>
          <TextInput
            onChange={formik.handleChange}
            label="t Asiantarkastajan titteli"
            id={`expert_inspector_title_${batch.id}`}
            name="expert_inspector_title"
            errorText={getErrorMessage('expert_inspector_title')}
            invalid={!!formik.errors.expert_inspector_title}
            value={formik.values.expert_inspector_title ?? ''}
            required
          />
        </$GridCell>
      </FormSection>

      <FormSection>
        <$GridCell $colSpan={3}>
          <Button
            disabled={isSubmitted}
            type="submit"
            theme="coat"
            variant="primary"
          >
            {batch.proposal_for_decision === PROPOSALS_FOR_DECISION.ACCEPTED
              ? t('common:batches.actions.markToPaymentAndArchive')
              : t('common:batches.actions.markToArchive')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={4} alignSelf="end">
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconArrowUndo />}
            onClick={() => markBatchAs(BATCH_STATUSES.DRAFT)}
          >
            {t('common:batches.actions.markAsWaitingForAhjo')}
          </Button>
        </$GridCell>
      </FormSection>
    </form>
  );
};
export default BatchFooterAhjo;
