import { APPLICATION_FIELDS } from 'benefit/applicant/constants';
import { FormFieldsStep1 } from 'benefit/applicant/types/application';
import { FormikProps } from 'formik';
import { TextInput } from 'hds-react';
import React from 'react';
import InputMask from 'react-input-mask';
import LoadingSkeleton from 'react-loading-skeleton';
import { StyledCheckbox } from 'shared/components/forms/fields/styled';
import { FieldsDef } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';

import {
  StyledAddressContainer,
  StyledCompanyInfoColumn,
  StyledCompanyInfoContainer,
  StyledCompanyInfoRow,
  StyledCompanyInfoSection,
  StyledIBANContainer,
  StyledNotification,
} from './styled';
import useCompanyInfo from './useCompanyInfo';

interface CompanyInfoProps {
  getErrorMessage: (fieldName: string) => string | undefined;
  fields: FieldsDef;
  translationsBase: string;
  formik?: FormikProps<FormFieldsStep1>;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  getErrorMessage,
  fields,
  translationsBase,
  formik,
}) => {
  const { t, data, isLoading, shouldShowSkeleton, error } = useCompanyInfo();

  return (
    <FormSection header={t(`${translationsBase}.heading1`)} loading={isLoading}>
      <StyledCompanyInfoContainer>
        <StyledCompanyInfoSection>
          <StyledCompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <StyledCompanyInfoRow>{data.name}</StyledCompanyInfoRow>
                <StyledCompanyInfoRow>{data.businessId}</StyledCompanyInfoRow>
              </>
            )}
          </StyledCompanyInfoColumn>
          <StyledCompanyInfoColumn>
            {shouldShowSkeleton ? (
              <LoadingSkeleton width="90%" count={2} />
            ) : (
              <>
                <StyledCompanyInfoRow>
                  {data.streetAddress}
                </StyledCompanyInfoRow>
                <StyledCompanyInfoRow>
                  {data.postcode} {data.city}
                </StyledCompanyInfoRow>
              </>
            )}
          </StyledCompanyInfoColumn>
          <StyledCheckbox
            id={fields.hasCompanyOtherAddress.name}
            disabled={isLoading || !!error}
            name={fields.hasCompanyOtherAddress.name}
            label={fields.hasCompanyOtherAddress.label}
            required
            checked={formik?.values.hasCompanyOtherAddress === true}
            errorText={getErrorMessage(
              APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS
            )}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            aria-invalid={
              !!getErrorMessage(APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS)
            }
          />
        </StyledCompanyInfoSection>

        <StyledNotification
          label={t(
            `${translationsBase}.notifications.companyInformation.label`
          )}
          type={error ? 'error' : 'info'}
        >
          {error?.message ||
            t(`${translationsBase}.notifications.companyInformation.content`)}
        </StyledNotification>

        {formik?.values.hasCompanyOtherAddress && (
          <StyledAddressContainer>
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
          </StyledAddressContainer>
        )}

        <StyledIBANContainer>
          <InputMask
            mask={fields.companyIban.mask?.format ?? ''}
            maskChar={null}
            value={formik?.values.companyIban}
            onBlur={formik?.handleBlur}
            onChange={(e) => {
              const initValue = e.target.value;
              const value =
                fields.companyIban.mask?.stripVal(initValue) ?? initValue;
              return formik?.setFieldValue(fields.companyIban.name, value);
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
        </StyledIBANContainer>
      </StyledCompanyInfoContainer>
    </FormSection>
  );
};

export default CompanyInfo;
