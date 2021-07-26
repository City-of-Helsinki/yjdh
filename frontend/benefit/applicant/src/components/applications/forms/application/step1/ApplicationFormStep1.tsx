import { APPLICATION_FIELDS_STEP1 } from 'benefit/applicant/constants';
import { SelectionGroup, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { StyledRadioButton } from 'shared/components/forms/fields/styled';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';
import { phoneToLocal } from 'shared/utils/string.utils';

import DeMinimisAidForm from '../deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from '../deMinimisAid/list/DeMinimisAidsList';
import StepperActions from '../stepperActions/StepperActions';
import { StyledContactPersonContainer, StyledSubSection } from '../styled';
import CompanyInfo from './companyInfo/CompanyInfo';
import { useApplicationFormStep1 } from './useApplicationFormStep1';

const ApplicationFormStep1: React.FC = () => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    erazeDeminimisAids,
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
        <StyledContactPersonContainer>
          <TextInput
            id={fields.companyContactPersonFirstName.name}
            name={fields.companyContactPersonFirstName.name}
            label={fields.companyContactPersonFirstName.label}
            placeholder={fields.companyContactPersonFirstName.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
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
            onBlur={formik.handleBlur}
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
            onBlur={formik.handleBlur}
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
            onBlur={formik.handleBlur}
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
        </StyledContactPersonContainer>
      </FormSection>
      <FormSection
        header={t(`${translationsBase}.heading3`)}
        tooltip={t(`${translationsBase}.tooltips.heading3`)}
      >
        <StyledFormGroup>
          <SelectionGroup
            label={fields.deMinimisAid.label}
            direction="vertical"
            required
            errorText={getErrorMessage(APPLICATION_FIELDS_STEP1.DE_MINIMIS_AID)}
          >
            <StyledRadioButton
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
              onBlur={formik.handleBlur}
              // 3 states: null (none is selected), true, false
              checked={formik.values.deMinimisAid === false}
            />
            <StyledRadioButton
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
              onBlur={formik.handleBlur}
              checked={formik.values.deMinimisAid === true}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.deMinimisAid && (
          <StyledSubSection>
            <DeMinimisAidForm />
            <DeMinimisAidsList />
          </StyledSubSection>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        <StyledFormGroup>
          <SelectionGroup
            label={fields.coOperationNegotiations.label}
            direction="vertical"
            required
            errorText={getErrorMessage(
              APPLICATION_FIELDS_STEP1.CO_OPERATION_NEGOTIATIONS
            )}
          >
            <StyledRadioButton
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
              onBlur={formik.handleBlur}
              checked={formik.values.coOperationNegotiations === false}
            />
            <StyledRadioButton
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
              onBlur={formik.handleBlur}
              checked={formik.values.coOperationNegotiations === true}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.coOperationNegotiations && (
          <StyledSubSection>
            <StyledFormGroup>
              <TextArea
                id={fields.coOperationNegotiationsDescription.name}
                name={fields.coOperationNegotiationsDescription.name}
                label={fields.coOperationNegotiationsDescription.label}
                placeholder={
                  fields.coOperationNegotiationsDescription.placeholder
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
            </StyledFormGroup>
          </StyledSubSection>
        )}
      </FormSection>
      <StepperActions hasNext handleSubmit={handleSubmit} />
    </form>
  );
};

export default ApplicationFormStep1;
