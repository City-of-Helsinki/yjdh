import isBefore from 'date-fns/isBefore';
import { Notification } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { DATE_UI_REGEX } from 'shared/constants';
import { parseDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';
import DateInput from 'tet/admin/components/editor/DateInput';
import Dropdown from 'tet/admin/components/editor/Dropdown';
import NumberInput from 'tet/admin/components/editor/NumberInput';
import TextArea from 'tet/admin/components/editor/TextArea';
import TextInput from 'tet/admin/components/editor/TextInput';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import useLanguageOptions from 'tet-shared/hooks/translation/useLanguageOptions';
import TetPosting from 'tet-shared/types/tetposting';

const PostingDetails: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { required, description, date, website } = useValidationRules();
  const { control, setValue } = useFormContext<TetPosting>();

  const languageOptions = useLanguageOptions();
  const startDate = useWatch({
    control,
    name: 'start_date',
  });
  const endDate = useWatch({
    control,
    name: 'end_date',
  });

  React.useEffect(() => {
    if (isBefore(parseDate(endDate), parseDate(startDate))) {
      setValue('end_date', '');
    }
  }, [startDate, endDate, setValue]);

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
        <$GridCell $colSpan={3}>
          <DateInput
            id="start_date"
            testId="posting-form-start_date"
            label={t('common:editor.posting.startDateLabel')}
            required
            registerOptions={{ required, pattern: date.pattern }}
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
            helperText={t('common:editor.posting.endDateHelperText')}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <NumberInput
            id="spots"
            testId="posting-form-spots"
            label={t('common:editor.posting.spotsLabel')}
            registerOptions={{ required }}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <Dropdown
            id="languages"
            testId="posting-form-languages"
            options={languageOptions}
            label={t('common:editor.posting.contactLanguage')}
            registerOptions={{
              required,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={3} />
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
            required
          />
        </$GridCell>
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={6}>
          <TextInput
            id="website_url"
            label={t('common:editor.posting.website')}
            placeholder={t('common:editor.posting.website')}
            registerOptions={website}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
