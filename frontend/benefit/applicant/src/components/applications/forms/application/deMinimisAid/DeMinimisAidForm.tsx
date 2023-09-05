import {
  DE_MINIMIS_AID_GRANTED_AT_MAX_DATE,
  DE_MINIMIS_AID_GRANTED_AT_MIN_DATE,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
} from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { Button, DateInput, IconPlusCircle, TextInput } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import {
  formatStringFloatValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $DeMinimisGridPadded, $DeMinimisSubHeader } from './deMinimisAid.sc';
import { useDeminimisAid } from './useDeminimisAid';

interface DeMinimisAidFormProps {
  data: DeMinimisAid[];
  setUnfinishedDeMinimisAid: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeMinimisAidForm: React.FC<DeMinimisAidFormProps> = ({
  data,
  setUnfinishedDeMinimisAid,
}) => {
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

  const onSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    setUnfinishedDeMinimisAid(false);
    return handleSubmit(event);
  };

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement, Element>
  ): void => {
    setUnfinishedDeMinimisAid(false);
    const grantValuesAsString = Object.values(formik.values).reduce(
      (acc, val) => acc + val
    );
    if (grantValuesAsString !== '') {
      setUnfinishedDeMinimisAid(true);
    }
    formik.handleBlur(event);
  };

  return (
    <>
      <$GridCell $colSpan={10}>
        <$DeMinimisSubHeader>
          {t(`${translationsBase}.deMinimisAidsHeading`)}
        </$DeMinimisSubHeader>
      </$GridCell>
      <$DeMinimisGridPadded>
        <$GridCell $colSpan={4}>
          <TextInput
            id={fields.granter.name}
            name={fields.granter.name}
            label={fields.granter.label}
            placeholder={fields.granter.placeholder}
            onBlur={(event) => handleBlur(event)}
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
            onBlur={(event) => handleBlur(event)}
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
            helperText={t(
              `${translationsBase}.fields.deMinimisAidAmount.helperText`
            )}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id={fields.grantedAt.name}
            name={fields.grantedAt.name}
            label={fields.grantedAt.label}
            placeholder={fields.grantedAt.placeholder}
            language={language}
            onBlur={(event) => handleBlur(event)}
            onChange={(value) =>
              formik.setFieldValue(fields.grantedAt.name, value)
            }
            value={formik.values.grantedAt}
            invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            errorText={getErrorMessage(DE_MINIMIS_AID_KEYS.GRANTED_AT)}
            minDate={DE_MINIMIS_AID_GRANTED_AT_MIN_DATE}
            maxDate={DE_MINIMIS_AID_GRANTED_AT_MAX_DATE}
            required
          />
        </$GridCell>

        <$GridCell
          $colSpan={3}
          css={`
            margin-left: auto;
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
            onClick={(e) => onSubmit(e)}
            iconLeft={<IconPlusCircle />}
            fullWidth
          >
            {t(`${translationsBase}.deMinimisAidsAdd`)}
          </Button>
        </$GridCell>
      </$DeMinimisGridPadded>
    </>
  );
};

export default DeMinimisAidForm;
