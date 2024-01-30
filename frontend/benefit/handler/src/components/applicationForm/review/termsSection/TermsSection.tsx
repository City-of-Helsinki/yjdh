import { ReviewChildProps } from 'benefit/handler/types/common';
import { TextProp } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import { capitalize } from 'shared/utils/string.utils';

import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

const TermsSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
}) => {
  const { t } = useTranslation();
  const cbPrefix = 'application_consent';
  const locale = useLocale();
  const textLocale = capitalize(locale);

  return (
    <SummarySection
      header={t(`${translationsBase}.headings.validity`)}
      action={<EditButton section="termsSection" dispatchStep={dispatchStep} />}
      withoutDivider
      paddingBottom
    >
      {data?.applicantTermsInEffect?.applicantConsents.map((consent, i) => (
        <$GridCell $colSpan={12} id="termsSection" key={consent.id}>
          <$Checkbox
            id={`${cbPrefix}_${consent.id}`}
            name={`${cbPrefix}_${i}`}
            label={`${consent[`text${textLocale}` as TextProp]}`}
            aria-invalid={false}
            checked
            disabled
          />
        </$GridCell>
      ))}
    </SummarySection>
  );
};

export default TermsSection;
