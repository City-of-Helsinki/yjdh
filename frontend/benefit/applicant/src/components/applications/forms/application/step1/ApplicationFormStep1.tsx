import { APPLICATION_FIELDS_STEP1 } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Select, SelectionGroup, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import { phoneToLocal } from 'shared/utils/string.utils';

import { $ContactPersonContainer, $SubSection } from '../Application.sc';
import DeMinimisAidForm from '../deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from '../deMinimisAid/list/DeMinimisAidsList';
import StepperActions from '../stepperActions/StepperActions';
import CompanyInfo from './companyInfo/CompanyInfo';
import { useApplicationFormStep1 } from './useApplicationFormStep1';

const ApplicationFormStep1: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    erazeDeminimisAids,
    getDefaultSelectValue,
    languageOptions,
    fields,
    translationsBase,
    formik,
    deMinimisAids,
  } = useApplicationFormStep1(data);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CompanyInfo
        getErrorMessage={getErrorMessage}
        formik={formik}
        translationsBase={translationsBase}
        fields={fields}
      />
      <FormSection header={t(`${translationsBase}.heading2`)}>
        <$ContactPersonContainer>
          <TextInput
            id={fields.companyContactPersonFirstName.name}
            name={fields.companyContactPersonFirstName.name}
            label={fields.companyContactPersonFirstName.label}
            placeholder={fields.companyContactPersonFirstName.placeholder}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonFirstName}
            invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_FIRST_NAME
              )
            }
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_FIRST_NAME
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_FIRST_NAME
            )}
            required
          />
          <TextInput
            id={fields.companyContactPersonLastName.name}
            name={fields.companyContactPersonLastName.name}
            label={fields.companyContactPersonLastName.label}
            placeholder={fields.companyContactPersonLastName.placeholder}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonLastName}
            invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_LAST_NAME
              )
            }
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_LAST_NAME
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_LAST_NAME
            )}
            required
          />
          <TextInput
            id={fields.companyContactPersonPhoneNumber.name}
            name={fields.companyContactPersonPhoneNumber.name}
            label={fields.companyContactPersonPhoneNumber.label}
            placeholder={fields.companyContactPersonPhoneNumber.placeholder}
            onChange={formik.handleChange}
            value={phoneToLocal(formik.values.companyContactPersonPhoneNumber)}
            invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_PHONE_NUMBER
              )
            }
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_PHONE_NUMBER
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_PHONE_NUMBER
            )}
            required
          />
          <TextInput
            id={fields.companyContactPersonEmail.name}
            name={fields.companyContactPersonEmail.name}
            label={fields.companyContactPersonEmail.label}
            placeholder={fields.companyContactPersonEmail.placeholder}
            onChange={formik.handleChange}
            value={formik.values.companyContactPersonEmail}
            invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_EMAIL
              )
            }
            aria-invalid={
              !!getErrorMessage(
                APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_EMAIL
              )
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.COMPANY_CONTACT_PERSON_EMAIL
            )}
            required
          />
          <Select
            defaultValue={getDefaultSelectValue(
              APPLICATION_FIELDS_STEP1.APPLICANT_LANGUAGE
            )}
            helper={getErrorMessage(
              APPLICATION_FIELDS_STEP1.APPLICANT_LANGUAGE
            )}
            optionLabelField="label"
            label={fields.applicantLanguage.label}
            onChange={(language: Option) =>
              formik.setFieldValue(
                APPLICATION_FIELDS_STEP1.APPLICANT_LANGUAGE,
                language.value
              )
            }
            options={languageOptions}
            id={fields.applicantLanguage.name}
            placeholder={t('common:select')}
            invalid={
              !!getErrorMessage(APPLICATION_FIELDS_STEP1.APPLICANT_LANGUAGE)
            }
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS_STEP1.APPLICANT_LANGUAGE)
            }
            required
          />
        </$ContactPersonContainer>
      </FormSection>
      <FormSection
        header={t(`${translationsBase}.heading3`)}
        tooltip={t(`${translationsBase}.tooltips.heading3`)}
      >
        <$FormGroup>
          <SelectionGroup
            label={fields.deMinimisAid.label}
            direction="vertical"
            required
            errorText={getErrorMessage(APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID)}
          >
            <$RadioButton
              id={`${fields.deMinimisAid.name}False`}
              name={fields.deMinimisAid.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID}.no`
              )}
              onChange={() => {
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID,
                  false
                );
                erazeDeminimisAids();
              }}
              // 3 states: null (none is selected), true, false
              checked={formik.values.deMinimisAid === false}
            />
            <$RadioButton
              id={`${fields.deMinimisAid.name}True`}
              name={fields.deMinimisAid.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID}.yes`
              )}
              onChange={() =>
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID,
                  true
                )
              }
              checked={formik.values.deMinimisAid === true}
            />
          </SelectionGroup>
        </$FormGroup>
        {formik.values.deMinimisAid && (
          <$SubSection>
            <DeMinimisAidForm data={deMinimisAids} />
            <DeMinimisAidsList />
          </$SubSection>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        <$FormGroup>
          <SelectionGroup
            label={fields.coOperationNegotiations.label}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS
            )}
          >
            <$RadioButton
              id={`${fields.coOperationNegotiations.name}False`}
              name={fields.coOperationNegotiations.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS}.no`
              )}
              onChange={() => {
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS,
                  false
                );
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
                  ''
                );
              }}
              checked={formik.values.coOperationNegotiations === false}
            />
            <$RadioButton
              id={`${fields.coOperationNegotiations.name}True`}
              name={fields.coOperationNegotiations.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS}.yes`
              )}
              onChange={() =>
                formik.setFieldValue(
                  APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS,
                  true
                )
              }
              checked={formik.values.coOperationNegotiations === true}
            />
          </SelectionGroup>
        </$FormGroup>
        {formik.values.coOperationNegotiations && (
          <$SubSection>
            <$FormGroup>
              <TextArea
                id={fields.coOperationNegotiationsDescription.name}
                name={fields.coOperationNegotiationsDescription.name}
                label={fields.coOperationNegotiationsDescription.label}
                placeholder={
                  fields.coOperationNegotiationsDescription.placeholder
                }
                onChange={formik.handleChange}
                value={formik.values.coOperationNegotiationsDescription}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS_DESCRIPTION
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS_DESCRIPTION
                  )
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS_DESCRIPTION
                )}
              />
            </$FormGroup>
          </$SubSection>
        )}
      </FormSection>
      <StepperActions hasNext handleSubmit={handleSubmit} />
    </form>
  );
};

export default ApplicationFormStep1;
