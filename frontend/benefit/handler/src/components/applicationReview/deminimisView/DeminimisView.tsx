import {
  $SummaryTableHeader,
  $SummaryTableLastLine,
  $SummaryTableValue,
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/newApplication/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

const DeminimisView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading3`)}
      action={!ACTIONLESS_STATUSES.includes(data.status) ? <span /> : null}
      section="deMinimisAids"
    >
      {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
        <>
          <$GridCell $colSpan={4}>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidGranter`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidAmount`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell>
            <$SummaryTableHeader>
              <$ViewFieldBold>
                {t(`${translationsBase}.fields.deMinimisAidGrantedAt`)}
              </$ViewFieldBold>
            </$SummaryTableHeader>
          </$GridCell>
          {data.deMinimisAidSet?.map(({ granter, grantedAt, amount }) => (
            <React.Fragment
              key={`${granter ?? ''}${convertToUIDateFormat(grantedAt)}`}
            >
              <$GridCell $colStart={1} $colSpan={4}>
                <$SummaryTableValue>{granter}</$SummaryTableValue>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <$SummaryTableValue>
                  {amount
                    ? formatFloatToCurrency(amount, 'EUR', 'FI-fi', 0)
                    : ''}
                </$SummaryTableValue>
              </$GridCell>
              <$GridCell>
                <$SummaryTableValue>
                  {grantedAt ? convertToUIDateFormat(grantedAt) : ''}
                </$SummaryTableValue>
              </$GridCell>
            </React.Fragment>
          ))}
          <$GridCell $colSpan={4} $colStart={1}>
            <$SummaryTableLastLine>
              {t(`${translationsBase}.fields.deMinimisAidTotal`)}
            </$SummaryTableLastLine>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <$SummaryTableLastLine>
              {data?.totalDeminimisAmount
                ? formatFloatToCurrency(
                    data.totalDeminimisAmount,
                    'EUR',
                    'FI-fi',
                    0
                  )
                : ''}
            </$SummaryTableLastLine>
          </$GridCell>
        </>
      ) : (
        <$GridCell $colSpan={12}>
          <$ViewField>
            {t(`${translationsBase}.fields.deMinimisAidsNo`)}
          </$ViewField>
        </$GridCell>
      )}
    </ReviewSection>
  );
};

export default DeminimisView;
