import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import {
  ApplicationReviewViewProps,
  DeMinimisAid,
} from 'benefit/handler/types/application';
import sumBy from 'lodash/sumBy';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $SummaryTableHeader,
  $SummaryTableValue,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat, formatDate } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';

const DeminimisView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading3`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <></> : null}
    >
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
              key={`${aid.granter ?? ''}${formatDate(
                new Date(aid.grantedAt || '')
              )}`}
            >
              <$GridCell $colStart={1} $colSpan={3}>
                <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$SummaryTableValue>{`${formatStringFloatValue(
                  aid.amount || ''
                )} €`}</$SummaryTableValue>
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
              {`${sumBy(data.deMinimisAidSet, (grant) =>
                Number(grant.amount)
              )} €`}
            </$SummaryTableValue>
          </$GridCell>
        </>
      ) : (
        '-'
      )}
    </ReviewSection>
  );
};

export default DeminimisView;
