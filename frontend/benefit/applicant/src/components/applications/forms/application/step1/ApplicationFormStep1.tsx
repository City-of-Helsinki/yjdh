import {
  Checkbox,
  Notification,
  RadioButton,
  SelectionGroup,
  TextArea,
  TextInput,
} from 'hds-react';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { StyledFormGroup } from 'shared/components/forms/section/styled';

import {
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledNotificationContent,
  StyledSubSection,
} from '../styled';
import { useComponent } from './extended';

export type ApplicationFormStep1Values = {
  companyId: string;
  companyOtherAdressStreet: string;
};

const ApplicationFormStep1 = (): React.ReactElement => {
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
              label={t(`${translationsBase}.notifications.companyInfo.label`)}
              type="info"
            >
              <StyledNotificationContent>
                {t(`${translationsBase}.notifications.companyInfo.content`)}
              </StyledNotificationContent>
            </Notification>
          </StyledCompanyInfoSection>
        </StyledCompanyInfoContainer>
        <StyledFormGroup>
          <Checkbox
            id={fields.hasCompanyOtherAddress.name}
            name={fields.hasCompanyOtherAddress.name}
            label={fields.hasCompanyOtherAddress.label}
            required
            checked={formik.values.hasCompanyOtherAddress === true}
            errorText={getErrorMessage('hasCompanyOtherAddress')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!getErrorMessage('hasCompanyOtherAddress')}
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
              invalid={!!getErrorMessage('companyOtherAddressStreet')}
              aria-invalid={!!getErrorMessage('companyOtherAddressStreet')}
              errorText={getErrorMessage('companyOtherAddressStreet')}
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
              invalid={!!getErrorMessage('companyOtherAddressZipCode')}
              aria-invalid={!!getErrorMessage('companyOtherAddressZipCode')}
              errorText={getErrorMessage('companyOtherAddressZipCode')}
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
              invalid={!!getErrorMessage('companyOtherAddressPostalDistrict')}
              aria-invalid={
                !!getErrorMessage('companyOtherAddressPostalDistrict')
              }
              errorText={getErrorMessage('companyOtherAddressPostalDistrict')}
              required
            />
          </StyledFormGroup>
        )}
        <StyledFormGroup>
          <TextInput
            id={fields.companyIban.name}
            name={fields.companyIban.name}
            label={fields.companyIban.label}
            placeholder={fields.companyIban.placeholder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.companyIban}
            invalid={!!getErrorMessage('companyIban')}
            aria-invalid={!!getErrorMessage('companyIban')}
            errorText={getErrorMessage('companyIban')}
            required
          />
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
            invalid={!!getErrorMessage('contactPersonFirstName')}
            aria-invalid={!!getErrorMessage('contactPersonFirstName')}
            errorText={getErrorMessage('contactPersonFirstName')}
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
            invalid={!!getErrorMessage('contactPersonLastName')}
            aria-invalid={!!getErrorMessage('contactPersonLastName')}
            errorText={getErrorMessage('contactPersonLastName')}
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
            invalid={!!getErrorMessage('contactPersonPhone')}
            aria-invalid={!!getErrorMessage('contactPersonPhone')}
            errorText={getErrorMessage('contactPersonPhone')}
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
            invalid={!!getErrorMessage('contactPersonEmail')}
            aria-invalid={!!getErrorMessage('contactPersonEmail')}
            errorText={getErrorMessage('contactPersonEmail')}
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
            errorText={getErrorMessage('deMinimisAidGranted')}
          >
            <RadioButton
              id={`${fields.deMinimisAidGranted.name}False`}
              name={fields.deMinimisAidGranted.name}
              value="false"
              label={t(`${translationsBase}.fields.deMinimisAidGranted.no`)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.deMinimisAidGranted === 'false'}
            />
            <RadioButton
              id={`${fields.deMinimisAidGranted.name}True`}
              name={fields.deMinimisAidGranted.name}
              value="true"
              label={t(`${translationsBase}.fields.deMinimisAidGranted.yes`)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.deMinimisAidGranted === 'true'}
            />
          </SelectionGroup>
        </StyledFormGroup>
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        <StyledFormGroup>
          <SelectionGroup
            label={fields.collectiveBargainingOngoing.label}
            direction="vertical"
            required
            errorText={getErrorMessage('cooperationStatus')}
          >
            <RadioButton
              id={`${fields.collectiveBargainingOngoing.name}False`}
              name={fields.collectiveBargainingOngoing.name}
              value="false"
              label={t(
                `${translationsBase}.fields.collectiveBargainingOngoing.no`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.collectiveBargainingOngoing === 'false'}
            />
            <RadioButton
              id={`${fields.collectiveBargainingOngoing.name}True`}
              name={fields.collectiveBargainingOngoing.name}
              value="true"
              label={t(
                `${translationsBase}.fields.collectiveBargainingOngoing.yes`
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.collectiveBargainingOngoing === 'true'}
            />
          </SelectionGroup>
        </StyledFormGroup>
        {formik.values.collectiveBargainingOngoing === 'true' && (
          <StyledFormGroup>
            <StyledSubSection>
              <TextArea
                id={fields.collectiveBargainingInfo.name}
                name={fields.collectiveBargainingInfo.name}
                label={fields.collectiveBargainingInfo.label}
                placeholder={fields.collectiveBargainingInfo.placeholder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.collectiveBargainingInfo}
                invalid={!!getErrorMessage('collectiveBargainingInfo')}
                aria-invalid={!!getErrorMessage('collectiveBargainingInfo')}
                errorText={getErrorMessage('collectiveBargainingInfo')}
              />
            </StyledSubSection>
          </StyledFormGroup>
        )}
      </FormSection>
    </form>
  );
};

export default ApplicationFormStep1;
