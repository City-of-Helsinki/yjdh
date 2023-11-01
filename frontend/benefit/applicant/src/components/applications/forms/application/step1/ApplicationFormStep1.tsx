import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/applicant/constants';
import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import { useAlertBeforeLeaving } from 'benefit/applicant/hooks/useAlertBeforeLeaving';
import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { APPLICATION_FIELDS_STEP1_KEYS } from 'benefit-shared/constants';
import { Select, SelectionGroup, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $GridCell,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import { phoneToLocal } from 'shared/utils/string.utils';

import { $SubFieldContainer } from '../Application.sc';
import DeMinimisAidForm from '../deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from '../deMinimisAid/list/DeMinimisAidsList';
import { useDeminimisAidsList } from '../deMinimisAid/list/useDeminimisAidsList';
import StepperActions from '../stepperActions/StepperActions';
import CompanyInfo from './companyInfo/CompanyInfo';
import { useApplicationFormStep1 } from './useApplicationFormStep1';
import { getTouchedAndInvalidFields } from '../utils';

const ApplicationFormStep1: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const [isUnfinishedDeMinimisAid, setUnfinishedDeMinimisAid] =
    React.useState(false);

  const {
    t,
    handleSubmit,
    handleSave,
    handleDelete,
    getErrorMessage,
    clearDeminimisAids,
    getDefaultLanguage,
    showDeminimisSection,
    languageOptions,
    fields,
    translationsBase,
    formik,
    deMinimisAidSet,
  } = useApplicationFormStep1(data, Boolean(isUnfinishedDeMinimisAid));

  useAlertBeforeLeaving(formik.dirty);

  useDependentFieldsEffect(
    {
      associationHasBusinessActivities:
        formik.values.associationHasBusinessActivities,
    },
    {
      isFormDirty: formik.dirty,
      clearDeminimisAids,
    }
  );

  const { setDeMinimisAids } = React.useContext(DeMinimisContext);
  const { deMinimisTotal } = useDeminimisAidsList();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CompanyInfo
        getErrorMessage={getErrorMessage}
        formik={formik}
        translationsBase={translationsBase}
        fields={fields}
      />
      <FormSection headerLevel="h2" header={t(`${translationsBase}.heading2`)}>
        <$GridCell $colSpan={12}>
          <$SubHeader weight="400">
            {t(`${translationsBase}.companyContactPerson.content`)}
          </$SubHeader>
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.companyContactPersonFirstName.name}
            name={fields.companyContactPersonFirstName.name}
            label={fields.companyContactPersonFirstName.label}
            placeholder={fields.companyContactPersonFirstName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonFirstName}
            invalid={
              !!getErrorMessage(fields.companyContactPersonFirstName.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.companyContactPersonFirstName.name)
            }
            errorText={getErrorMessage(
              fields.companyContactPersonFirstName.name
            )}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.companyContactPersonLastName.name}
            name={fields.companyContactPersonLastName.name}
            label={fields.companyContactPersonLastName.label}
            placeholder={fields.companyContactPersonLastName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonLastName}
            invalid={
              !!getErrorMessage(fields.companyContactPersonLastName.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.companyContactPersonLastName.name)
            }
            errorText={getErrorMessage(
              fields.companyContactPersonLastName.name
            )}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.companyContactPersonPhoneNumber.name}
            name={fields.companyContactPersonPhoneNumber.name}
            label={fields.companyContactPersonPhoneNumber.label}
            placeholder={fields.companyContactPersonPhoneNumber.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={phoneToLocal(formik.values.companyContactPersonPhoneNumber)}
            invalid={
              !!getErrorMessage(fields.companyContactPersonPhoneNumber.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.companyContactPersonPhoneNumber.name)
            }
            errorText={getErrorMessage(
              fields.companyContactPersonPhoneNumber.name
            )}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <TextInput
            id={fields.companyContactPersonEmail.name}
            name={fields.companyContactPersonEmail.name}
            label={fields.companyContactPersonEmail.label}
            placeholder={fields.companyContactPersonEmail.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonEmail}
            invalid={!!getErrorMessage(fields.companyContactPersonEmail.name)}
            aria-invalid={
              !!getErrorMessage(fields.companyContactPersonEmail.name)
            }
            errorText={getErrorMessage(fields.companyContactPersonEmail.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <Select
            defaultValue={getDefaultLanguage()}
            helper={getErrorMessage(fields.applicantLanguage.name)}
            optionLabelField="label"
            label={fields.applicantLanguage.label}
            onChange={(language: Option) =>
              formik.setFieldValue(
                fields.applicantLanguage.name,
                language.value
              )
            }
            options={languageOptions}
            id={fields.applicantLanguage.name}
            placeholder={t('common:select')}
            invalid={!!getErrorMessage(fields.applicantLanguage.name)}
            aria-invalid={!!getErrorMessage(fields.applicantLanguage.name)}
            required
          />
        </$GridCell>
      </FormSection>
      {showDeminimisSection && (
        <FormSection
          headerLevel="h2"
          header={t(`${translationsBase}.heading3`)}
          tooltip={t(`${translationsBase}.tooltips.heading3`)}
        >
          <$GridCell $colSpan={8}>
            <SelectionGroup
              id={fields.deMinimisAid.name}
              label={fields.deMinimisAid.label}
              direction="vertical"
              required
              errorText={getErrorMessage(fields.deMinimisAid.name)}
            >
              <$RadioButton
                id={`${fields.deMinimisAid.name}False`}
                name={fields.deMinimisAid.name}
                value="false"
                label={t(
                  `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID}.no`
                )}
                onChange={() => {
                  formik.setFieldValue(fields.deMinimisAid.name, false);
                  formik.setFieldValue(fields.deMinimisAidSet.name, []);
                  setUnfinishedDeMinimisAid(false);
                  setDeMinimisAids([]);
                }}
                // 3 states: null (none is selected), true, false
                checked={formik.values.deMinimisAid === false}
              />
              <$RadioButton
                id={`${fields.deMinimisAid.name}True`}
                name={fields.deMinimisAid.name}
                value="true"
                label={t(
                  `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID}.yes`
                )}
                onChange={() =>
                  formik.setFieldValue(fields.deMinimisAid.name, true)
                }
                checked={formik.values.deMinimisAid === true}
              />
            </SelectionGroup>
          </$GridCell>

          {formik.values.deMinimisAid && (
            <$SubFieldContainer $colSpan={12}>
              <DeMinimisAidForm
                data={deMinimisAidSet}
                setUnfinishedDeMinimisAid={setUnfinishedDeMinimisAid}
              />
              <DeMinimisAidsList />
            </$SubFieldContainer>
          )}
        </FormSection>
      )}
      <FormSection
        paddingBottom
        headerLevel="h2"
        header={t(`${translationsBase}.heading4`)}
      >
        <$GridCell $colSpan={12}>
          <SelectionGroup
            id={fields.coOperationNegotiations.name}
            label={fields.coOperationNegotiations.label}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.coOperationNegotiations.name)}
            tooltipText={`${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS}.tooltipText`}
          >
            <$RadioButton
              id={`${fields.coOperationNegotiations.name}False`}
              name={fields.coOperationNegotiations.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS}.no`
              )}
              onChange={() => {
                formik.setFieldValue(
                  fields.coOperationNegotiations.name,
                  false
                );
              }}
              checked={formik.values.coOperationNegotiations === false}
            />
            <$RadioButton
              id={`${fields.coOperationNegotiations.name}True`}
              name={fields.coOperationNegotiations.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS}.yes`
              )}
              onChange={() =>
                formik.setFieldValue(fields.coOperationNegotiations.name, true)
              }
              checked={formik.values.coOperationNegotiations === true}
            />
          </SelectionGroup>
        </$GridCell>
        {formik.values.coOperationNegotiations && (
          <$SubFieldContainer $colSpan={7}>
            <$GridCell $colSpan={8} $rowSpan={8}>
              <TextArea
                id={fields.coOperationNegotiationsDescription.name}
                name={fields.coOperationNegotiationsDescription.name}
                label={fields.coOperationNegotiationsDescription.label}
                placeholder={
                  fields.coOperationNegotiationsDescription.placeholder
                }
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.coOperationNegotiationsDescription}
                invalid={
                  !!getErrorMessage(
                    fields.coOperationNegotiationsDescription.name
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    fields.coOperationNegotiationsDescription.name
                  )
                }
                errorText={getErrorMessage(
                  fields.coOperationNegotiationsDescription.name
                )}
                required
              />
            </$GridCell>
          </$SubFieldContainer>
        )}
      </FormSection>
      <StepperActions
        disabledNext={deMinimisTotal() > MAX_DEMINIMIS_AID_TOTAL_AMOUNT}
        handleSubmit={handleSubmit}
        handleSave={
          getTouchedAndInvalidFields(formik.touched, formik.errors).length ===
            0 && !isUnfinishedDeMinimisAid
            ? handleSave
            : undefined
        }
        handleDelete={data?.id ? handleDelete : null}
      />
    </form>
  );
};

export default ApplicationFormStep1;
