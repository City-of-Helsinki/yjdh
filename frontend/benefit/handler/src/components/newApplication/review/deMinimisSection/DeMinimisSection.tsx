import { ReviewChildProps } from 'benefit/handler/types/common';
import { DeMinimisAid } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $SummaryTableHeader,
  $SummaryTableValue,
  $ViewField,
} from '../../ApplicationForm.sc';
import SummarySection from '../summarySection/SummarySection';

const DeMinimisSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SummarySection
      gap={theme.spacing.xs3}
      header={t(`${translationsBase}.headings.company3`)}
      withoutDivider
    >
      {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
        <>
          <$GridCell $colSpan={3}>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidGranter.label`)}
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidAmount.label`)}
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidGrantedAt.labelShort`)}
            </$SummaryTableHeader>
          </$GridCell>
          {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
            <React.Fragment
              key={`${aid.granter ?? ''}${convertToUIDateFormat(
                aid.grantedAt
              )}`}
            >
              <$GridCell $colStart={1} $colSpan={3}>
                <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$SummaryTableValue>
                  {formatStringFloatValue(aid.amount)}
                </$SummaryTableValue>
              </$GridCell>
              <$GridCell>
                <$SummaryTableValue>
                  {aid.grantedAt ? convertToUIDateFormat(aid.grantedAt) : ''}
                </$SummaryTableValue>
              </$GridCell>
            </React.Fragment>
          ))}
        </>
      ) : (
        <$GridCell $colSpan={12}>
          <$ViewField>
            {t(`${translationsBase}.fields.deMinimisAid.no`)}
          </$ViewField>
        </$GridCell>
      )}
    </SummarySection>
  );
};

export default DeMinimisSection;
