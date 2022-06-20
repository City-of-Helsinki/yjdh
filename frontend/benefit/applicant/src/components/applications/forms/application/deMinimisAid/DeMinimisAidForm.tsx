import {
  DE_MINIMIS_AID_GRANTED_AT_MAX_DATE,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
} from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { Button, DateInput, IconPlusCircle, TextInput } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import {
  $Grid,
  $GridCell,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import {
  formatStringFloatValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { useDeminimisAid } from './useDeminimisAid';

interface DeMinimisAidFormProps {
  data: DeMinimisAid[];
}

const DeMinimisAidForm: React.FC<DeMinimisAidFormProps> = ({ data }) => {
  const {
    t,
    language,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
    grants,
  } = useDeminimisAid(data);
  const theme = useTheme();

  return (
    <$GridCell
      $colStart={3}
      $colSpan={10}
      as={$Grid}
      columns={10}
      css={`
        margin-bottom: ${theme.spacing.s};
      `}
    >
      <$GridCell $colSpan={10}>
        <$SubHeader>{t(`${translationsBase}.deMinimisAidsHeading`)}</$SubHeader>
      </$GridCell>
      <$GridCell
        $colSpan={8}
        as={$Grid}
        columns={8}
        bgColor
        bgHorizontalPadding
        bgVerticalPadding
      >
        <$GridCell $colSpan={4}>
          <TextInput
            id={fields.granter.name}
            name={fields.granter.name}
            label={fields.granter.label}
            placeholder={fields.granter.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.granter}
            invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTER)}
            aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTER)}
            errorText={getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTER)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.amount.name}
            name={fields.amount.name}
            label={fields.amount.label || ''}
            placeholder={fields.amount.placeholder}
            onBlur={formik.handleBlur}
            onChange={(e) =>
              formik.setFieldValue(
                fields.amount.name,
                stringFloatToFixed(e.target.value)
              )
            }
            value={formatStringFloatValue(formik.values.amount)}
            invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.AMOUNT)}
            aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.AMOUNT)}
            errorText={getErrorMessage(DE_MINIMIS_AID_KEYS.AMOUNT)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <DateInput
            id={fields.grantedAt.name}
            name={fields.grantedAt.name}
            label={fields.grantedAt.label}
            placeholder={fields.grantedAt.placeholder}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) =>
              formik.setFieldValue(fields.grantedAt.name, value)
            }
            value={formik.values.grantedAt}
            invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            errorText={getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            maxDate={DE_MINIMIS_AID_GRANTED_AT_MAX_DATE}
            required
          />
        </$GridCell>
      </$GridCell>
      <$GridCell
        $colSpan={2}
        css={`
          padding-top: 25px;
          padding-left: ${theme.spacing.s};
        `}
      >
        <Button
          theme="coat"
          disabled={
            !(
              formik.values.granter &&
              formik.values.amount &&
              formik.values.grantedAt
            ) ||
            !formik.isValid ||
            sumBy(grants, 'amount') > MAX_DEMINIMIS_AID_TOTAL_AMOUNT
          }
          onClick={(e) => handleSubmit(e)}
          iconLeft={<IconPlusCircle />}
          fullWidth
        >
          {t(`${translationsBase}.deMinimisAidsAdd`)}
        </Button>
      </$GridCell>
    </$GridCell>
  );
};

export default DeMinimisAidForm;
