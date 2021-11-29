import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { Application, DeMinimisAid } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $SummaryTableHeader,
  $SummaryTableValue,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

export interface DeminimisViewProps {
  data: Application;
}

const DeminimisView: React.FC<DeminimisViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <>
      <ReviewSection header={t(`${translationsBase}.headings.heading3`)}>
        {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
          <>
            <$GridCell $colSpan={3}>
              <$SummaryTableHeader>
                {t(`${translationsBase}.fields.deMinimisAidGranter`)}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$SummaryTableHeader>
                {t(`${translationsBase}.fields.deMinimisAidAmount`)}
              </$SummaryTableHeader>
            </$GridCell>
            <$GridCell>
              <$SummaryTableHeader>
                {t(`${translationsBase}.fields.deMinimisAidGrantedAt`)}
              </$SummaryTableHeader>
            </$GridCell>
            {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
              <React.Fragment
                key={`${aid.granter ?? ''}${aid.grantedAt ?? ''}`}
              >
                <$GridCell $colStart={1} $colSpan={3}>
                  <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
                </$GridCell>
                <$GridCell $colSpan={2}>
                  <$SummaryTableValue>{`${
                    aid.amount || ''
                  } €`}</$SummaryTableValue>
                </$GridCell>
                <$GridCell>
                  <$SummaryTableValue>
                    {aid.grantedAt ? convertToUIDateFormat(aid.grantedAt) : ''}
                  </$SummaryTableValue>
                </$GridCell>
              </React.Fragment>
            ))}
            <$GridCell $colStart={1} $colSpan={3}>
              <$SummaryTableValue isBold>
                {t(`${translationsBase}.fields.deMinimisAidTotal`)}
              </$SummaryTableValue>
            </$GridCell>
            <$GridCell $colSpan={2}>
              <$SummaryTableValue isBold>
                {`${data.deMinimisAidSet.reduce(
                  (partial_sum, a) => partial_sum + Number(a.amount),
                  0
                )} €`}
              </$SummaryTableValue>
            </$GridCell>
          </>
        ) : (
          '-'
        )}
      </ReviewSection>
    </>
  );
};

export default DeminimisView;
