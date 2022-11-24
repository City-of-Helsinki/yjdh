import { NumberInput as HdsNumberInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';
import TetPosting from 'tet-shared/types/tetposting';

type SpotsType = Pick<TetPosting, 'spots'>;

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  id: Id<SpotsType>;
  testId?: string;
  label: string;
  registerOptions: RegisterOptions;
  required: boolean;
};

const NumberInput: React.FC<Props> = ({ id, registerOptions, label, required = false, testId }) => {
  const { control } = useFormContext<SpotsType>();
  const { t } = useTranslation();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <HdsNumberInput
          id={id}
          data-testid={testId}
          label={label}
          value={value}
          min={1}
          step={1}
          minusStepButtonAriaLabel={t('common:editor.posting.spotsDecrease')}
          plusStepButtonAriaLabel={t('common:editor.posting.spotsIncrease')}
          required={required}
          onChange={onChange}
          errorText={error ? error.message : ''}
        />
      )}
      control={control}
      rules={registerOptions}
    />
  );
};

export default NumberInput;
