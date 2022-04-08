import useSchoolListQuery from 'kesaseteli/youth/hooks/backend/useSchoolListQuery';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import School from 'kesaseteli-shared/types/School';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Checkbox from 'shared/components/forms/inputs/Checkbox';
import Dropdown from 'shared/components/forms/inputs/Dropdown';
import TextInput from 'shared/components/forms/inputs/TextInput';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { NAMES_REGEX } from 'shared/constants';
import useToggle from 'shared/hooks/useToggle';

const SchoolSelection: React.FC = () => {
  const { t } = useTranslation();
  const register = useRegisterInput<YouthFormData>('youthApplication');

  const [schoolIsUnlisted, toggleSchoolIsUnlisted] = useToggle(false);

  const { clearErrors, setValue } = useFormContext<YouthFormData>();

  const schoolListQuery = useSchoolListQuery();
  const schools: School[] = schoolListQuery.isSuccess
    ? schoolListQuery.data.map((name) => ({ name }))
    : [];

  const schoolsPlaceholderText = React.useMemo(
    () =>
      schoolListQuery.isSuccess
        ? t('common:youthApplication.form.schoolsPlaceholder')
        : t('common:youthApplication.form.schoolsLoading'),
    [schoolListQuery.isSuccess, t]
  );

  const handleToggleSchoolUnlisted = React.useCallback(
    (unlisted?: boolean) => {
      if (unlisted) {
        clearErrors('selectedSchool');
        setValue('selectedSchool', null);
      } else {
        clearErrors('unlistedSchool');
        setValue('unlistedSchool', '');
      }
      toggleSchoolIsUnlisted();
    },
    [clearErrors, setValue, toggleSchoolIsUnlisted]
  );

  return (
    <>
      <Dropdown<YouthFormData, School>
        type="combobox"
        {...register('selectedSchool', { required: !schoolIsUnlisted })}
        optionLabelField="name"
        options={schools}
        disabled={schoolIsUnlisted || !schoolListQuery.isSuccess}
        placeholder={schoolsPlaceholderText}
        $colSpan={2}
        label={t('common:youthApplication.form.schoolsDropdown')}
      />
      <$GridCell $colSpan={2}>
        <Checkbox<YouthFormData>
          {...register('is_unlisted_school')}
          onChange={handleToggleSchoolUnlisted}
        />
      </$GridCell>
      {schoolIsUnlisted && (
        <TextInput<YouthFormData>
          {...register('unlistedSchool', {
            required: true,
            maxLength: 256,
            pattern: NAMES_REGEX,
          })}
          $colSpan={2}
          label={t('common:youthApplication.form.unlistedSchool')}
          placeholder={t(
            'common:youthApplication.form.unlistedSchoolPlaceholder'
          )}
        />
      )}
    </>
  );
};

export default SchoolSelection;
