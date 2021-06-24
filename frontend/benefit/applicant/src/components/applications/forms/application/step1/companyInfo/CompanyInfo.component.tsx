import { APPLICATION_FIELDS } from 'benefit/applicant/constants';
import { TextInput } from 'hds-react';
import React from 'react';
import InputMask from 'react-input-mask';
import { StyledCheckbox } from 'shared/components/forms/fields/styled';
import FormSection from 'shared/components/forms/section/FormSection';

import { useComponent } from '../extended';
import SC from './CompanyInfo.sc';

export interface CompanyInfoProps {
  data: {
    name: string;
    streetAddress: string;
    postcode: string;
    city: string;
    businessId: string;
  };
  error?: string;
  loading?: boolean;
  translationsBase: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ data, error, loading }) => {
  const {
    t,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
  } = useComponent();

  let formattedData = { ...data, businessId: `Y-tunnus: ${data.businessId}` };
  if (error)
    formattedData = {
      name: '-',
      streetAddress: '-',
      postcode: '-',
      city: '',
      businessId: '-',
    };
  if (loading)
    formattedData = {
      name: '',
      streetAddress: '',
      postcode: '',
      city: '',
      businessId: '',
    };

  return (
    <FormSection header={t(`${translationsBase}.heading1`)} loading={loading}>
      <SC.CompanyInfoContainer>
        <SC.CompanyInfoSection>
          <SC.CompanyInfoColumn>
            <SC.CompanyInfoRow $loading={loading}>
              {formattedData.name}
            </SC.CompanyInfoRow>
            <SC.CompanyInfoRow $loading={loading}>
              {formattedData.businessId}
            </SC.CompanyInfoRow>
          </SC.CompanyInfoColumn>
          <SC.CompanyInfoColumn>
            <SC.CompanyInfoRow $loading={loading}>
              {formattedData.streetAddress}
            </SC.CompanyInfoRow>
            <SC.CompanyInfoRow $loading={loading}>
              {formattedData.postcode} {formattedData.city}
            </SC.CompanyInfoRow>
          </SC.CompanyInfoColumn>
          <StyledCheckbox
            id={fields.hasCompanyOtherAddress.name}
            disabled={loading || !!error}
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
        </SC.CompanyInfoSection>

        <SC.Notification
          label={t(
            `${translationsBase}.notifications.companyInformation.label`
          )}
          type={error ? 'error' : 'info'}
        >
          {error ||
            t(`${translationsBase}.notifications.companyInformation.content`)}
        </SC.Notification>

        {formik.values.hasCompanyOtherAddress && (
          <SC.AddressContainer>
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
          </SC.AddressContainer>
        )}

        <SC.IBANContainer>
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
        </SC.IBANContainer>
      </SC.CompanyInfoContainer>
    </FormSection>
  );
};

export default CompanyInfo;
