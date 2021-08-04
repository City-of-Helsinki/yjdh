import { $SecondaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { $SubActionContainer } from 'benefit/applicant/components/applications/forms/application/Application.sc';
import {
  DE_MINIMIS_AID_FIELDS,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
  SUPPORTED_LANGUAGES,
} from 'benefit/applicant/constants';
import { DeMinimisAid } from 'benefit/applicant/types/application';
import { DateInput, IconPlusCircle, TextInput } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import {
  $FieldsContainerWithPadding,
  $FormGroup,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import { useDeminimisAid } from './useDeminimisAid';

interface DeMinimisAidFormProps {
  data: DeMinimisAid[];
}

const DeMinimisAidForm: React.FC<DeMinimisAidFormProps> = ({ data }) => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
    grants,
  } = useDeminimisAid(data);

  return (
    <>
      <$SubHeader>{t(`${translationsBase}.deMinimisAidsHeading`)}</$SubHeader>
      <>
        <$FormGroup backgroundColor={theme.colors.silverLight}>
          <$FieldsContainerWithPadding>
            <TextInput
              id={fields.granter.name}
              name={fields.granter.name}
              label={fields.granter.label}
              placeholder={fields.granter.placeholder}
              onChange={formik.handleChange}
              value={formik.values.granter}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              required
            />
            <TextInput
              id={fields.amount.name}
              name={fields.amount.name}
              label={fields.amount.label || ''}
              placeholder={fields.amount.placeholder}
              onChange={formik.handleChange}
              value={formik.values.amount?.toString()}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              required
            />
            <DateInput
              id={fields.grantedAt.name}
              name={fields.grantedAt.name}
              label={fields.grantedAt.label}
              placeholder={fields.grantedAt.placeholder}
              language={SUPPORTED_LANGUAGES.FI}
              onChange={(value) =>
                formik.setFieldValue(fields.grantedAt.name, value)
              }
              value={formik.values.grantedAt}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTED_AT)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTED_AT)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTED_AT)}
              maxDate={new Date()}
              required
            />
          </$FieldsContainerWithPadding>
          <$SubActionContainer>
            <$SecondaryButton
              disabled={
                sumBy(grants, 'amount') > MAX_DEMINIMIS_AID_TOTAL_AMOUNT
              }
              onClick={(e) => handleSubmit(e)}
              variant="secondary"
              iconLeft={<IconPlusCircle />}
            >
              {t(`${translationsBase}.deMinimisAidsAdd`)}
            </$SecondaryButton>
          </$SubActionContainer>
        </$FormGroup>
      </>
    </>
  );
};

export default DeMinimisAidForm;
