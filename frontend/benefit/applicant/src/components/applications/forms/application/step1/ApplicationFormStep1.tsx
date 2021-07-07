import { APPLICATION_FIELDS } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { SelectionGroup, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { StyledRadioButton } from 'shared/components/forms/fields/styled';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';

import DeMinimisAidForm from '../deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from '../deMinimisAid/list/DeMinimisAidsList';
import { StyledSubSection } from '../styled';
import CompanyInfo from './companyInfo/CompanyInfo';
import { useApplicationFormStep1 } from './useApplicationFormStep1';

const ApplicationFormStep1: React.FC<DynamicFormStepComponentProps> = ({
  actions,
}) => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
  } = useApplicationFormStep1();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CompanyInfo
        getErrorMessage={getErrorMessage}
        formik={formik}
        translationsBase={translationsBase}
        fields={fields}
      />
      <FormSection header={t(`${translationsBase}.heading2`)}>
        <StyledFormGroup>
          <TextInput
            id={fields.contactPersonFirstName.name}
            name={fields.contactPersonFirstName.name}
            label={fields.contactPersonFirstName.label}
            placeholder={fields.contactPersonFirstName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactPersonFirstName}
            invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME)
            }
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME)
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME
            )}
            required
          />
          <TextInput
            id={fields.contactPersonLastName.name}
            name={fields.contactPersonLastName.name}
            label={fields.contactPersonLastName.label}
            placeholder={fields.contactPersonLastName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactPersonLastName}
            invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME)
            }
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME)
            }
            errorText={getErrorMessage(
              APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME
            )}
            required
          />
          <TextInput
            id={fields.contactPersonPhone.name}
            name={fields.contactPersonPhone.name}
            label={fields.contactPersonPhone.label}
            placeholder={fields.contactPersonPhone.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactPersonPhone}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_PHONE)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_PHONE)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_PHONE)}
            required
          />
          <TextInput
            id={fields.contactPersonEmail.name}
            name={fields.contactPersonEmail.name}
            label={fields.contactPersonEmail.label}
            placeholder={fields.contactPersonEmail.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.contactPersonEmail}
            invalid={!!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_EMAIL)}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_EMAIL)
            }
            errorText={getErrorMessage(APPLICATION_FIELDS.CONTACT_PERSON_EMAIL)}
            required
          />
        </StyledFormGroup>
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading3`)}>
        <StyledFormGroup>
          <SelectionGroup
            label={fields.deMinimisAidGranted.label}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED
            )}
          >
            <StyledRadioButton
              id={`${fields.deMinimisAidGranted.name}False`}
              name={fields.deMinimisAidGranted.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED}.no`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.deMinimisAidGranted === 'false'}
            />
            <StyledRadioButton
              id={`${fields.deMinimisAidGranted.name}True`}
              name={fields.deMinimisAidGranted.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED}.yes`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.deMinimisAidGranted === 'true'}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.deMinimisAidGranted === 'true' && (
          <StyledSubSection>
            <DeMinimisAidForm />
            <DeMinimisAidsList />
          </StyledSubSection>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        <StyledFormGroup>
          <SelectionGroup
            label={fields.collectiveBargainingOngoing.label}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING
            )}
          >
            <StyledRadioButton
              id={`${fields.collectiveBargainingOngoing.name}False`}
              name={fields.collectiveBargainingOngoing.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING}.no`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.collectiveBargainingOngoing === 'false'}
            />
            <StyledRadioButton
              id={`${fields.collectiveBargainingOngoing.name}True`}
              name={fields.collectiveBargainingOngoing.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING}.yes`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.collectiveBargainingOngoing === 'true'}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.collectiveBargainingOngoing === 'true' && (
          <StyledSubSection>
            <StyledFormGroup>
              <TextArea
                id={fields.collectiveBargainingInfo.name}
                name={fields.collectiveBargainingInfo.name}
                label={fields.collectiveBargainingInfo.label}
                placeholder={fields.collectiveBargainingInfo.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.collectiveBargainingInfo}
                invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO
                  )
                }
                errorText={getErrorMessage(
                  APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO
                )}
              />
            </StyledFormGroup>
          </StyledSubSection>
        )}
      </FormSection>
      {actions}
    </form>
  );
};

export default ApplicationFormStep1;
