import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import TetPosting from 'tet/admin/types/tetposting';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';

const ActionButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();

  return (
    <FormSection withoutDivider>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={3}>
          <Button type="submit" disabled={isSubmitting}>
            {t('common:editor.saveDraft')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <Button disabled={isSubmitting} onClick={() => alert('Not implemented')}>
            {t('common:editor.deletePosting')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={2}>{null}</$GridCell>
        <$GridCell $colSpan={3}>
          <Button disabled={isSubmitting} onClick={() => alert('Not implemented')}>
            {t('common:editor.preview')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <Button disabled={isSubmitting} onClick={() => alert('Not implemented')}>
            {t('common:editor.publish')}
          </Button>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default ActionButtons;
