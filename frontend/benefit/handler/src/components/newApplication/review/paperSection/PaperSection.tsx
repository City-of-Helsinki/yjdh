import { ReviewChildProps } from 'benefit/handler/types/common';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import { $ViewField, $ViewFieldBold } from '../../ApplicationForm.sc';
import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

const PaperSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
  fields,
}) => {
  const { t } = useTranslation();

  return (
    <SummarySection
      header={t(`${translationsBase}.headings.paper2`)}
      action={
        <EditButton
          section={fields.paperApplicationDate.name}
          dispatchStep={dispatchStep}
        />
      }
    >
      <$GridCell $colSpan={6}>
        <$ViewField>
          {t(`${translationsBase}.fields.paperApplicationDate.bigLabel`)}
        </$ViewField>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.paperApplicationDate.label`)}
        </$ViewFieldBold>
        <$ViewField>
          {convertToUIDateFormat(data?.paperApplicationDate) || '-'}
        </$ViewField>
      </$GridCell>
    </SummarySection>
  );
};

export default PaperSection;
