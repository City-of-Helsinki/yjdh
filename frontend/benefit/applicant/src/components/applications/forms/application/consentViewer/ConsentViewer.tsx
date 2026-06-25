import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { TermsProp, TextProp } from 'benefit-shared/types/application';
import { LinkSize } from 'hds-react';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import OpenInNewTabLink from '../../../../link/OpenInNewTabLink';
import { useConsentViewer } from './useConsentViewer';

const ConsentViewer: React.FC<DynamicFormStepComponentProps> = ({ data }) => {
  const { textLocale, cbPrefix, t } = useConsentViewer();
  const theme = useTheme();

  const termsPdfLinks = React.useMemo(
    () =>
      [
        { termsKey: 'terms1', urlKey: `termsPdf${textLocale}` },
        { termsKey: 'terms2', urlKey: `termsPdf2${textLocale}` },
        { termsKey: 'terms3', urlKey: `termsPdf3${textLocale}` },
        { termsKey: 'terms4', urlKey: `termsPdf4${textLocale}` },
      ]
        .map(({ termsKey, urlKey }) => ({
          termsKey,
          url: data?.applicantTermsApproval?.terms?.[urlKey as TermsProp] ?? '',
        }))
        .filter(({ url }) => url.length > 0),
    [data?.applicantTermsApproval?.terms, textLocale]
  );

  if (!data) return null;
  return (
    <>
      {termsPdfLinks.map(({ url, termsKey }) => (
        <$GridCell $colSpan={12} key={termsKey}>
          <OpenInNewTabLink
            style={{ color: theme.colors.black }}
            external
            openInExternalDomainAriaLabel={t(
              'common:pdfViewer.openInExternalDomainAriaLabel'
            )}
            size={LinkSize.Medium}
            openInNewTab
            href={url}
          >
            {t(`common:pdfViewer.${termsKey}`)}
          </OpenInNewTabLink>
        </$GridCell>
      ))}
      {data?.applicantTermsApproval?.terms?.applicantConsents?.map(
        (consent, i) => (
          <$GridCell $colSpan={12} key={consent.id}>
            <$Checkbox
              id={`${cbPrefix}_${consent.id}`}
              name={`${cbPrefix}_${i}`}
              label={(consent[`text${textLocale}` as TextProp] || '')
                .split(/\\n/)
                .map((line) => (
                  <React.Fragment key={`${consent.id}-${line}`}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
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
