import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import StatusLabel from 'benefit/handler/components/statusLabel/StatusLabel';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import {
  $HandledHeader,
  $HandledHr,
  $HandledRow,
  $HandledSection,
} from '../HandledView.sc';

const ArchivedView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review.summary.archived';
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ReviewSection withoutDivider>
      <$HandledSection>
        <$HandledHeader>
          <$ViewFieldBold style={{ color: theme.colors.coatOfArms }}>
            {t(`${translationsBase}.ready`)}
          </$ViewFieldBold>
          <StatusLabel status={data.status} />
        </$HandledHeader>
        <$ViewFieldBold large>
          {t(`${translationsBase}.${data.status || ''}`)}
        </$ViewFieldBold>
        <$HandledHr dashed />
        <$HandledRow largeMargin>
          <$GridCell $colSpan={3} $colStart={1}>
            <$ViewFieldBold>
              {t(`${translationsBase}.decisionMakerName`)}
              <$ViewField topMargin>{data.batch?.decisionMakerName}</$ViewField>
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t(`${translationsBase}.decisionMakerTitle`)}
              <$ViewField topMargin>
                {data.batch?.decisionMakerTitle}
              </$ViewField>
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t(`${translationsBase}.decisionDate`)}
              <$ViewField topMargin>
                {convertToUIDateFormat(data.batch?.decisionDate)}
              </$ViewField>
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t(`${translationsBase}.sectionOfTheLaw`)}
              <$ViewField topMargin>{data.batch?.sectionOfTheLaw}</$ViewField>
            </$ViewFieldBold>
          </$GridCell>
        </$HandledRow>
        <$HandledHr />

        {data.batch?.p2PInspectorName && (
          <>
            <$HandledRow largeMargin>
              <$GridCell $colSpan={12} $colStart={1}>
                <$ViewFieldBold large style={{ marginBottom: theme.spacing.m }}>
                  {t(`${translationsBase}.p2pTitle`)}
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3} $colStart={1}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.p2pInspector`)}
                  <$ViewField topMargin>
                    {data.batch?.p2PInspectorName}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.p2pInspectorEmail`)}
                  <$ViewField topMargin>
                    {data.batch?.p2PInspectorEmail}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.p2pDecisionMaker`)}
                  <$ViewField topMargin>
                    {data.batch?.p2PCheckerName}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
            </$HandledRow>
            <$HandledHr />
          </>
        )}
        {data.batch?.expertInspectorName && (
          <>
            <$HandledRow largeMargin>
              <$GridCell $colSpan={12} $colStart={1}>
                <$ViewFieldBold large style={{ marginBottom: theme.spacing.m }}>
                  {t(`${translationsBase}.ahjoTitle`)}
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3} $colStart={1}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.ahjoInspector`)}
                  <$ViewField topMargin>
                    {data.batch?.expertInspectorName}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.ahjoInspectorTitle`)}
                  <$ViewField topMargin>
                    {data.batch?.expertInspectorTitle}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <$ViewFieldBold>
                  {t(`${translationsBase}.p2pDecisionMaker`)}
                  <$ViewField topMargin>
                    {data.batch?.p2PCheckerName}
                  </$ViewField>
                </$ViewFieldBold>
              </$GridCell>
            </$HandledRow>
            <$HandledHr />
          </>
        )}
        <$HandledRow largeMargin>
          <$GridCell $colSpan={12} $colStart={1}>
            <$ViewFieldBold large style={{ marginBottom: theme.spacing.m }}>
              {t(`${translationsBase}.archivedTitle`)}
            </$ViewFieldBold>
          </$GridCell>
          <$GridCell $colSpan={3} $colStart={1}>
            <$ViewFieldBold>
              {t(`${translationsBase}.handler`)}
              <$ViewField topMargin>
                {getFullName(
                  data.batch?.handler?.firstName,
                  data.batch?.handler?.lastName
                )}
              </$ViewField>
            </$ViewFieldBold>
          </$GridCell>
        </$HandledRow>
      </$HandledSection>
    </ReviewSection>
  );
};

export default ArchivedView;
