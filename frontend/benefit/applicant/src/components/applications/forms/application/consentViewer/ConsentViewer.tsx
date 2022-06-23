import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { TermsProp, TextProp } from 'benefit-shared/types/application';
import { Link } from 'hds-react';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { useConsentViewer } from './useConsentViewer';

const ConsentViewer: React.FC<DynamicFormStepComponentProps> = ({ data }) => {
  const { textLocale, cbPrefix, t } = useConsentViewer();
  const theme = useTheme();

  if (!data) return null;
  return (
    <>
      {data && (
        <$GridCell $colSpan={12}>
          <Link
            style={{ color: theme.colors.black }}
            external
            openInExternalDomainAriaLabel="Opens a different website"
            size="M"
            openInNewTab
            href={
              data.applicantTermsApproval?.terms?.[
                `termsPdf${textLocale}` as TermsProp
              ] ?? ''
            }
          >
            {t('common:pdfViewer.terms')}
          </Link>
        </$GridCell>
      )}
      {data?.applicantTermsApproval?.terms?.applicantConsents?.map(
        (consent, i) => (
          <$GridCell $colSpan={12} key={consent.id}>
            <$Checkbox
              id={`${cbPrefix}_${consent.id}`}
              name={`${cbPrefix}_${i}`}
              label={consent[`text${textLocale}` as TextProp] || ''}
              disabled
              checked
              aria-invalid={false}
            />
          </$GridCell>
        )
      )}
    </>
  );
};

export default ConsentViewer;
