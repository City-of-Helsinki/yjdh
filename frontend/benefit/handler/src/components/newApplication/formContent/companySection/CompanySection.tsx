import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import {
  IconCheckCircleFill,
  Select,
  SelectionGroup,
  TextArea,
  TextInput,
} from 'hds-react';
import { TFunction } from 'next-i18next';
import React from 'react';
import InputMask from 'react-input-mask';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import { Option } from 'shared/components/forms/fields/types';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { OptionType } from 'shared/types/common';
import { phoneToLocal } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $HelpText } from '../FormContent.sc';
import {
  $CompanyInfoLabel,
  $CompanyInfoValue,
  $CompanyInfoWrapper,
  $IconWrapper,
} from './CompanySection.sc';
import DeMinimisAidForm from './deMinimisAid/DeMinimisAidForm';
import DeMinimisAidsList from './deMinimisAid/list/DeMinimisAidsList';

type Props = {
  t: TFunction;
  translationsBase: string;
  application: Application;
  formik: FormikProps<Partial<Application>>;
  fields: ApplicationFields;
  getErrorMessage: (fieldName: string) => string | undefined;
  languageOptions: OptionType[];
  showDeminimisSection: boolean;
  deMinimisAidSet: DeMinimisAid[];
};
const CompanySection: React.FC<Props> = ({
  t,
  application,
  translationsBase,
  formik,
  fields,
  getErrorMessage,
  languageOptions,
  showDeminimisSection,
  deMinimisAidSet,
}) => {
  const theme = useTheme();
  const { setDeMinimisAids } = React.useContext(DeMinimisContext);

  type WithCheckboxProps = {
    text: string;
    isBeginning?: boolean;
  };

  const WithCheckbox: React.FC<WithCheckboxProps> = ({
    text,
    isBeginning = false,
  }) => (
    <$IconWrapper $isBeginning={isBeginning}>
      {!isBeginning && text}
      <IconCheckCircleFill
        color="var(--color-tram)"
        aria-hidden="true"
        aria-label="check"
      />
      {isBeginning && text}
    </$IconWrapper>
  );

  return (
    <>
      <FormSection
        paddingBottom
        headerLevel="h2"
        header={t(`${translationsBase}.headings.company1`)}
      >
        <$GridCell as={$Grid} $colSpan={12} id="companySection">
          <$GridCell as={$Grid} $colSpan={12}>
            <$CompanyInfoWrapper>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.companyName`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                <WithCheckbox text={application?.company?.name} />
              </$CompanyInfoValue>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.companyBusinessId`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                <WithCheckbox text={application?.company?.businessId} />
              </$CompanyInfoValue>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.companyStreetAddress`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                <WithCheckbox text={application?.company?.streetAddress} />
              </$CompanyInfoValue>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.companyPostcode`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                <WithCheckbox text={application?.company?.postcode} />
              </$CompanyInfoValue>
              <$CompanyInfoLabel>
                {t(`${translationsBase}.companyCity`)}
              </$CompanyInfoLabel>
              <$CompanyInfoValue>
                <WithCheckbox text={application?.company?.city} />
              </$CompanyInfoValue>
            </$CompanyInfoWrapper>
            <$GridCell
              $colStart={1}
              $colSpan={12}
              css={`
                font-size: 1.1rem;
                margin-bottom: ${theme.spacing.m};
              `}
            >
              <WithCheckbox
                text={t(`${translationsBase}.companyInformationShort`)}
                isBeginning
              />
            </$GridCell>
          </$GridCell>
        </$GridCell>
        <$GridCell
          $colSpan={6}
          css={`
            font-size: 1.1rem;
            margin-bottom: ${theme.spacing.m};
          `}
        >
          <$Checkbox
            id={fields.useAlternativeAddress.name}
            name={fields.useAlternativeAddress.name}
            label={fields.useAlternativeAddress.label}
            checked={formik.values.useAlternativeAddress === true}
            errorText={getErrorMessage(fields.useAlternativeAddress.name)}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={!!getErrorMessage(fields.useAlternativeAddress.name)}
          />
        </$GridCell>
        {formik.values.useAlternativeAddress && (
          <$GridCell as={$Grid} $colSpan={12}>
            <$GridCell $colSpan={4}>
              <TextInput
                id={fields.companyDepartment.name}
                name={fields.companyDepartment.name}
                label={fields.companyDepartment.label}
                placeholder={fields.companyDepartment.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.companyDepartment}
                invalid={!!getErrorMessage(fields.companyDepartment.name)}
                aria-invalid={!!getErrorMessage(fields.companyDepartment.name)}
                errorText={getErrorMessage(fields.companyDepartment.name)}
              />
            </$GridCell>
            <$GridCell $colStart={1} $colSpan={4}>
              <TextInput
                id={fields.alternativeCompanyStreetAddress.name}
                name={fields.alternativeCompanyStreetAddress.name}
                label={fields.alternativeCompanyStreetAddress.label}
                placeholder={fields.alternativeCompanyStreetAddress.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.alternativeCompanyStreetAddress}
                invalid={
                  !!getErrorMessage(fields.alternativeCompanyStreetAddress.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.alternativeCompanyStreetAddress.name)
                }
                errorText={getErrorMessage(
                  fields.alternativeCompanyStreetAddress.name
                )}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={4}>
              <TextInput
                id={fields.alternativeCompanyPostcode.name}
                name={fields.alternativeCompanyPostcode.name}
                label={fields.alternativeCompanyPostcode.label}
                placeholder={fields.alternativeCompanyPostcode.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.alternativeCompanyPostcode}
                invalid={
                  !!getErrorMessage(fields.alternativeCompanyPostcode.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.alternativeCompanyPostcode.name)
                }
                errorText={getErrorMessage(
                  fields.alternativeCompanyPostcode.name
                )}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={4}>
              <TextInput
                id={fields.alternativeCompanyCity.name}
                name={fields.alternativeCompanyCity.name}
                label={fields.alternativeCompanyCity.label}
                placeholder={fields.alternativeCompanyCity.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.alternativeCompanyCity}
                invalid={!!getErrorMessage(fields.alternativeCompanyCity.name)}
                aria-invalid={
                  !!getErrorMessage(fields.alternativeCompanyCity.name)
                }
                errorText={getErrorMessage(fields.alternativeCompanyCity.name)}
                required
              />
            </$GridCell>
          </$GridCell>
        )}
        <$GridCell $colSpan={4} $colStart={1}>
          <InputMask
            mask={fields.companyBankAccountNumber.mask?.format ?? ''}
            maskChar={null}
            value={formik.values.companyBankAccountNumber}
            onBlur={formik.handleBlur}
            onChange={(e) => {
              const initValue = e.target.value;
              const value =
                fields.companyBankAccountNumber.mask?.stripVal(initValue) ??
                initValue;
              return formik.setFieldValue(
                fields.companyBankAccountNumber.name,
                value
              );
            }}
          >
            {() => (
              <TextInput
                id={fields.companyBankAccountNumber.name}
                name={fields.companyBankAccountNumber.name}
                label={fields.companyBankAccountNumber.label}
                invalid={
                  !!getErrorMessage(fields.companyBankAccountNumber.name)
                }
                aria-invalid={
                  !!getErrorMessage(fields.companyBankAccountNumber.name)
                }
                errorText={getErrorMessage(
                  fields.companyBankAccountNumber.name
                )}
                required
              />
            )}
          </InputMask>
          <$HelpText>{fields.companyBankAccountNumber.placeholder}</$HelpText>
        </$GridCell>
        {application?.company?.organizationType.toLowerCase() ===
          ORGANIZATION_TYPES.ASSOCIATION.toLowerCase() && (
          <$GridCell $colSpan={8} $colStart={1}>
            <SelectionGroup
              label={fields.associationHasBusinessActivities.label}
              direction="vertical"
              required
              errorText={getErrorMessage(
                fields.associationHasBusinessActivities.name
              )}
            >
              <$RadioButton
                id={`${fields.associationHasBusinessActivities.name}False`}
                name={fields.associationHasBusinessActivities.name}
                value="false"
                label={t(
                  `${translationsBase}.fields.${fields.associationHasBusinessActivities.name}.no`
                )}
                onChange={() => {
                  formik.setFieldValue(
                    fields.associationHasBusinessActivities.name,
                    false
                  );
                }}
                // 3 states: null (none is selected), true, false
                checked={
                  formik.values.associationHasBusinessActivities === false
                }
              />
              <$RadioButton
                id={`${fields.associationHasBusinessActivities.name}True`}
                name={fields.associationHasBusinessActivities.name}
                value="true"
                label={t(
                  `${translationsBase}.fields.${fields.associationHasBusinessActivities.name}.yes`
                )}
                onChange={() =>
                  formik.setFieldValue(
                    fields.associationHasBusinessActivities.name,
                    true
                  )
                }
                checked={
                  formik.values.associationHasBusinessActivities === true
                }
              />
            </SelectionGroup>
          </$GridCell>
        )}
      </FormSection>
      <FormSection header={t(`${translationsBase}.headings.company2`)}>
        <$GridCell $colSpan={4}>
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
        <$GridCell $colSpan={4}>
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
        <$GridCell $colStart={1} $colSpan={4}>
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
            defaultValue={{ label: 'Suomi', value: 'fi' }}
            helper={getErrorMessage(fields.applicantLanguage.name)}
            optionLabelField="label"
            label={fields.applicantLanguage.label}
            onChange={(lang: Option) =>
              formik.setFieldValue(fields.applicantLanguage.name, lang.value)
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
        <FormSection header={t(`${translationsBase}.headings.company3`)}>
          <$GridCell $colSpan={8}>
            <SelectionGroup
              id={`${fields.deMinimisAid.name}`}
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
                  `${translationsBase}.fields.${APPLICATION_FIELD_KEYS.DE_MINIMIS_AID}.no`
                )}
                onChange={() => {
                  formik.setFieldValue(fields.deMinimisAid.name, false);
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
                  `${translationsBase}.fields.${APPLICATION_FIELD_KEYS.DE_MINIMIS_AID}.yes`
                )}
                onChange={() =>
                  formik.setFieldValue(fields.deMinimisAid.name, true)
                }
                checked={formik.values.deMinimisAid === true}
              />
            </SelectionGroup>
          </$GridCell>

          {formik.values.deMinimisAid && (
            <>
              <DeMinimisAidForm data={deMinimisAidSet} />
              <DeMinimisAidsList />
            </>
          )}
        </FormSection>
      )}
      <FormSection header={t(`${translationsBase}.headings.company4`)}>
        <$GridCell $colSpan={8}>
          <SelectionGroup
            id={fields.coOperationNegotiations.name}
            label={fields.coOperationNegotiations.label}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.coOperationNegotiations.name)}
          >
            <$RadioButton
              id={`${fields.coOperationNegotiations.name}False`}
              name={fields.coOperationNegotiations.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS}.no`
              )}
              onChange={() => {
                formik.setFieldValue(
                  fields.coOperationNegotiations.name,
                  false
                );
                formik.setFieldValue(
                  APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
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
                `${translationsBase}.fields.${APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS}.yes`
              )}
              onChange={() =>
                formik.setFieldValue(fields.coOperationNegotiations.name, true)
              }
              checked={formik.values.coOperationNegotiations === true}
            />
          </SelectionGroup>
        </$GridCell>
        {formik.values.coOperationNegotiations && (
          <$GridCell
            $colSpan={8}
            css={`
              margin-top: ${theme.spacing.s};
            `}
          >
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
            />
          </$GridCell>
        )}
      </FormSection>
    </>
  );
};

export default CompanySection;
