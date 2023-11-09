import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import {
  APPLICATION_ORIGINS,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { TextProp } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import { capitalize } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import ConsentActions from './consentActions/ConsentActions';

const ConsentView: React.FC<ApplicationReviewViewProps> = ({
  data,
  isUploading,
  handleUpload,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  const cbPrefix = 'application_consent';
  const locale = useLocale();
  const textLocale = capitalize(locale);
  const theme = useTheme();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading9`)}
      section="approval"
      action={
        !ACTIONLESS_STATUSES.includes(data.status) ? (
          <ConsentActions
            isUploading={isUploading}
            handleUpload={handleUpload}
          />
        ) : null
      }
    >
      {data.applicationOrigin === APPLICATION_ORIGINS.APPLICANT ? (
        <$GridCell $colSpan={12}>
          <AttachmentsListView
            title={t(
              'common:applications.sections.attachments.types.employeeConsent.title'
            )}
            type={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
            attachments={data.attachments || []}
          />
        </$GridCell>
      ) : (
        data?.applicantTermsInEffect?.applicantConsents.map((consent, i) => (
          <$GridCell $colSpan={12} id="termsSection" key={consent.id}>
            <$Checkbox
              style={{ marginBottom: theme.spacing.xs }}
              id={`${cbPrefix}_${consent.id}`}
              name={`${cbPrefix}_${i}`}
              label={`${consent[`text${textLocale}` as TextProp]}`}
              aria-invalid={false}
              checked
              disabled
            />
          </$GridCell>
        ))
      )}
    </ReviewSection>
  );
};

export default ConsentView;
