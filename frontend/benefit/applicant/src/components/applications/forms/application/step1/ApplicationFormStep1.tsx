import { APPLICATION_FIELDS } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Notification, SelectionGroup, TextArea, TextInput } from 'hds-react';
import React from 'react';
import InputMask from 'react-input-mask';
import {
  StyledCheckbox,
  StyledRadioButton,
} from 'shared/components/forms/fields/styled';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';

import DeMinimisAidForm from '../deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from '../deMinimisAid/list/DeMinimisAidsList';
import {
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledNotificationContent,
  StyledSubSection,
} from '../styled';
import { useComponent } from './extended';

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
  } = useComponent();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        <StyledCompanyInfoContainer>
          <StyledCompanyInfoSection>
            <StyledCompanyInfoColumn>
              <StyledCompanyInfoRow>Herkkulautanen Oy</StyledCompanyInfoRow>
              <StyledCompanyInfoRow>Y-tunnus: 2114560-2</StyledCompanyInfoRow>
            </StyledCompanyInfoColumn>
            <StyledCompanyInfoColumn>
              <StyledCompanyInfoRow>Keskuskatu 13 A 11</StyledCompanyInfoRow>
              <StyledCompanyInfoRow>00100 Helsinki</StyledCompanyInfoRow>
            </StyledCompanyInfoColumn>
          </StyledCompanyInfoSection>
          <StyledCompanyInfoSection>
            <Notification
              label={t(
                `${translationsBase}.notifications.companyInformation.label`
              )}
              type="info"
            >
              <StyledNotificationContent>
                {t(
                  `${translationsBase}.notifications.companyInformation.content`
                )}
              </StyledNotificationContent>
            </Notification>
          </StyledCompanyInfoSection>
        </StyledCompanyInfoContainer>
        <StyledFormGroup>
          <StyledCheckbox
            id={fields.hasCompanyOtherAddress.name}
            name={fields.hasCompanyOtherAddress.name}
            label={fields.hasCompanyOtherAddress.label}
            required
            checked={formik.values.hasCompanyOtherAddress === true}
            errorText={getErrorMessage(
              APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS
            )}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS)
            }
          />
        </StyledFormGroup>
        {formik.values.hasCompanyOtherAddress && (
          <StyledFormGroup>
            <TextInput
              id={fields.companyOtherAddressStreet.name}
              name={fields.companyOtherAddressStreet.name}
              label={fields.companyOtherAddressStreet.label}
              placeholder={fields.companyOtherAddressStreet.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.companyOtherAddressStreet}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET
              )}
              required
            />
            <TextInput
              id={fields.companyOtherAddressZipCode.name}
              name={fields.companyOtherAddressZipCode.name}
              label={fields.companyOtherAddressZipCode.label}
              placeholder={fields.companyOtherAddressZipCode.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.companyOtherAddressZipCode}
              invalid={
                !!getErrorMessage(APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP)
              }
              aria-invalid={
                !!getErrorMessage(APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP)
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP
              )}
              required
            />
            <TextInput
              id={fields.companyOtherAddressPostalDistrict.name}
              name={fields.companyOtherAddressPostalDistrict.name}
              label={fields.companyOtherAddressPostalDistrict.label}
              placeholder={fields.companyOtherAddressPostalDistrict.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.companyOtherAddressPostalDistrict}
              invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT
                )
              }
              aria-invalid={
                !!getErrorMessage(
                  APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT
                )
              }
              errorText={getErrorMessage(
                APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT
              )}
              required
            />
          </StyledFormGroup>
        )}
        <StyledFormGroup>
          <InputMask
            mask={fields.companyIban.mask?.format ?? ''}
            maskChar={null}
            value={formik.values.companyIban}
            onBlur={formik.handleBlur}
            onChange={(e) => {
              const initValue = e.target.value;
              const value =
                fields.companyIban.mask?.stripVal(initValue) ?? initValue;
              return formik.setFieldValue(fields.companyIban.name, value);
            }}
          >
            {() => (
              <TextInput
                id={fields.companyIban.name}
                name={fields.companyIban.name}
                label={fields.companyIban.label}
                placeholder={fields.companyIban.placeholder}
                invalid={!!getErrorMessage(APPLICATION_FIELDS.COMPANY_IBAN)}
                aria-invalid={
                  !!getErrorMessage(APPLICATION_FIELDS.COMPANY_IBAN)
                }
                errorText={getErrorMessage(APPLICATION_FIELDS.COMPANY_IBAN)}
                required
              />
            )}
          </InputMask>
        </StyledFormGroup>
      </FormSection>
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
