import updateApplicationAlterationWithCsvQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationWithCsvQuery';
import { AlterationCsvProps } from 'benefit/handler/types/application';
import { Button, IconDownload } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { downloadFile } from 'shared/utils/file.utils';
import { stringToFloatValue } from 'shared/utils/string.utils';

const AlterationCsvButton: React.FC<AlterationCsvProps> = ({
  theme,
  secondary,
  alteration,
  values,
  onSubmit,
  isAlterationValid = true,
}) => {
  const { t } = useTranslation();
  const updateMutation = updateApplicationAlterationWithCsvQuery();

  if (!values) return null;

  const data = {
    application: values.application,
    recovery_start_date: convertToBackendDateFormat(values.recoveryStartDate),
    recovery_end_date: convertToBackendDateFormat(values.recoveryEndDate),
    recovery_amount: values.isRecoverable
      ? String(stringToFloatValue(values.recoveryAmount))
      : '0',
    recovery_justification: values.recoveryJustification,
    is_recoverable: values.isRecoverable,
  };

  const handleDownloadCsv = async (): Promise<void> => {
    try {
      const response = await updateMutation.mutateAsync({
        id: alteration.id,
        applicationId: alteration.application,
        data,
      });
      downloadFile(response, 'csv');
      onSubmit(); // Call the onSubmit function after successful download
    } catch (error) {
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <Button
      data-testid="button-download-alteration-csv"
      theme={theme}
      variant={secondary ? 'secondary' : 'primary'}
      iconLeft={<IconDownload />}
      onClick={handleDownloadCsv}
      disabled={!isAlterationValid || updateMutation.isLoading}
    >
      {updateMutation.isLoading
        ? t('common:utility.downloading')
        : t('common:applications.alterations.handling.talpaCsv.button')}
    </Button>
  );
};

export default AlterationCsvButton;
