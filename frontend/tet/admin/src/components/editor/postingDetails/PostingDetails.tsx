import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import DateInput from 'tet/admin/components/editor/DateInput';
import TextInput from 'tet/admin/components/editor/TextInput';
import TextArea from 'tet/admin/components/editor/TextArea';
import NumberInput from 'tet/admin/components/editor/NumberInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import { Notification } from 'hds-react';
import Dropdown from 'tet/admin/components/editor/Dropdown';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import { useFormContext, useWatch } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import { parseDate, isValidDate } from 'shared/utils/date.utils';
import { DATE_UI_REGEX } from 'shared/constants';
import isBefore from 'date-fns/isBefore';

const PostingDetails: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { required, name, description, date } = useValidationRules();
  const { control, setValue } = useFormContext<TetPosting>();

  const languageOptions = useLanguageOptions();
  const startDate = useWatch({
    control: control,
    name: 'start_date',
  });
  const endDate = useWatch({
    control: control,
    name: 'end_date',
  });

  React.useEffect(() => {
    if (isBefore(parseDate(endDate) as Date, parseDate(startDate) as Date)) {
      setValue('end_date', '');
    }
  }, [startDate, endDate]);

  const minDate = DATE_UI_REGEX.test(startDate) ? parseDate(startDate) : undefined;

  return (
    <FormSection header={t('common:editor.posting.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={6}>
          <TextInput
            id="title"
            testId="posting-form-title"
            label={t('common:editor.posting.title')}
            placeholder={t('common:editor.posting.title')}
            registerOptions={name}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id="start_date"
            testId="posting-form-start_date"
            label={t('common:editor.posting.startDateLabel')}
            required={true}
            registerOptions={{ required: required, pattern: date.pattern }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id="end_date"
            testId="posting-form-end_date"
            label={t('common:editor.posting.endDateLabel')}
            required={false}
            registerOptions={{ pattern: date.pattern }}
            minDate={minDate}
          />
        </$GridCell>
        <$GridCell $colSpan={3}></$GridCell>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <NumberInput
          id="spots"
          testId="posting-form-spots"
          label={t('common:editor.posting.spotsLabel')}
          registerOptions={{ required: required }}
          required={true}
        />
      </$GridCell>
      <$GridCell $colSpan={3}>
        <Dropdown
          id="languages"
          testId="posting-form-languages"
          options={languageOptions}
          initialValue={[languageOptions[0]]}
          label={t('common:editor.posting.contactLanguage')}
          registerOptions={{
            required: required,
          }}
        />
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={6}>
          <Notification size="small">{t('common:editor.posting.workHoursNotice')}</Notification>
        </$GridCell>
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={12}>
          <TextArea
            id="description"
            testId="posting-form-description"
            label={t('common:editor.posting.description')}
            registerOptions={description}
            required={true}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
