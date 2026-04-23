import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import { useCurrentYearSummerVoucherConfig } from 'kesaseteli-shared/hooks/useCurrentYearSummerVoucherConfig';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import SelectionGroup from 'shared/components/forms/inputs/SelectionGroup';

const TargetGroupSelection: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegisterInput<YouthFormData>('youthApplication');
  const {
    query: { isLoading, isError },
    currentConfiguration,
  } = useCurrentYearSummerVoucherConfig();
  const targetGroups = currentConfiguration?.target_groups;

  if (isLoading) {
    return <div>{t('common:youthApplication.form.targetGroupsLoading')}</div>;
  }

  if (isError || !targetGroups || targetGroups.length === 0) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold', gridColumn: 'span 2' }}>
        {t('common:youthApplication.form.targetGroupsError')}
      </div>
    );
  }

  const values = targetGroups.map((tg) => tg.id);
  const getValueText = (id: string): string =>
    targetGroups.find((tg) => tg.id === id)?.name ?? '';

  return (
    <SelectionGroup<YouthFormData>
      {...register('target_group', { required: true })}
      values={values}
      getValueText={getValueText}
      $colSpan={2}
    />
  );
};

export default TargetGroupSelection;
