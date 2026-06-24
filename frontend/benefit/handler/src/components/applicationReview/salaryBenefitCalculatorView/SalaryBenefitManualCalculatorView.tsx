import { CALCULATION_SALARY_KEYS } from 'benefit/handler/constants';
import { SalaryBenefitManualCalculatorViewProps } from 'benefit/handler/types/application';
import { TextArea, TextInput } from 'hds-react';
import * as React from 'react';
import { Field } from 'shared/components/forms/fields/types';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

const SalaryBenefitManualCalculatorView: React.FC<
  SalaryBenefitManualCalculatorViewProps
> = ({ formik, fields, getErrorMessage }) => {
  const { overrideMonthlyBenefitAmount, overrideMonthlyBenefitAmountComment } =
    fields as {
      [key in CALCULATION_SALARY_KEYS]: Field<CALCULATION_SALARY_KEYS>;
    };

  return (
    <>
      <$GridCell $colStart={1} $colSpan={2}>
        <TextInput
          id={overrideMonthlyBenefitAmount?.name}
          name={overrideMonthlyBenefitAmount?.name}
          label={overrideMonthlyBenefitAmount?.label}
          onChange={(e) =>
            formik.setFieldValue(
              overrideMonthlyBenefitAmount?.name,
              e.target.value
            )
          }
          value={formatStringFloatValue(
            formik.values.overrideMonthlyBenefitAmount ?? ''
          )}
          invalid={!!getErrorMessage(overrideMonthlyBenefitAmount?.name)}
          aria-invalid={!!getErrorMessage(overrideMonthlyBenefitAmount?.name)}
          errorText={getErrorMessage(overrideMonthlyBenefitAmount?.name)}
          required
        />
      </$GridCell>

      <$GridCell $colStart={1} $colSpan={6}>
        <TextArea
          id={overrideMonthlyBenefitAmountComment?.name}
          name={overrideMonthlyBenefitAmountComment?.name}
          label={overrideMonthlyBenefitAmountComment?.label}
          placeholder={overrideMonthlyBenefitAmountComment?.placeholder}
          value={formik.values.overrideMonthlyBenefitAmountComment}
          onChange={(e) =>
            formik.setFieldValue(
              overrideMonthlyBenefitAmountComment?.name,
              e.target.value
            )
          }
          required
        />
      </$GridCell>
    </>
  );
};

export default SalaryBenefitManualCalculatorView;
