import { $AlterationAccordionItem } from 'benefit/applicant/components/applications/alteration/AlterationAccordionItem.sc';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { ALTERATION_STATE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { Button, IconTrash } from 'hds-react';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  alteration: ApplicationAlteration;
  application: Application;
};

const AlterationAccordionItem = ({
  alteration,
  application,
}: Props): JSX.Element => {
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <$AlterationAccordionItem
      card
      size="s"
      language={locale}
      headingLevel={3}
      heading={t(
        `common:applications.decision.alterationList.item.heading.${alteration.alterationType}`,
        {
          endDate: convertToUIDateFormat(alteration.endDate),
          resumeDate: alteration.resumeDate
            ? convertToUIDateFormat(alteration.resumeDate)
            : '',
        }
      )}
    >
      <$Grid as="dl">
        <$GridCell $colSpan={3}>
          <dt>
            {t('common:applications.decision.alterationList.item.state.label')}
          </dt>
          <dd>
            {t(
              `common:applications.decision.alterationList.item.state.${alteration.state}`
            )}
          </dd>
        </$GridCell>
        {alteration.state === ALTERATION_STATE.HANDLED ? (
          <>
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.recoveryAmount'
                )}
              </dt>
              <dd>{alteration.recoveryAmount}</dd>
            </$GridCell>
            <$GridCell $colSpan={6}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.recoveryPeriod'
                )}
              </dt>
              <dd>
                {alteration.recoveryStartDate}–{alteration.recoveryEndDate}
              </dd>
            </$GridCell>
          </>
        ) : (
          <$GridCell $colSpan={9} />
        )}
        <$GridCell $colSpan={3}>
          <dt>
            {t(
              'common:applications.decision.alterationList.item.contactPersonName'
            )}
          </dt>
          <dd>{alteration.contactPersonName}</dd>
        </$GridCell>
        {alteration.useEinvoice ? (
          <>
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.einvoiceProviderName'
                )}
              </dt>
              <dd>{alteration.einvoiceProviderName}</dd>
            </$GridCell>
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.einvoiceProviderIdentifier'
                )}
              </dt>
              <dd>{alteration.einvoiceProviderIdentifier}</dd>
            </$GridCell>
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.einvoiceAddress'
                )}
              </dt>
              <dd>{alteration.einvoiceAddress}</dd>
            </$GridCell>
          </>
        ) : (
          <$GridCell $colSpan={9}>
            <dt>
              {t(
                'common:applications.decision.alterationList.item.deliveryAddress'
              )}
            </dt>
            <dd>
              {application.company.streetAddress},{' '}
              {application.company.postcode} {application.company.city}
            </dd>
          </$GridCell>
        )}
      </$Grid>
      <Button theme="black" variant="secondary" iconLeft={<IconTrash />}>
        {t('common:applications.decision.alterationList.item.actions.delete')}
      </Button>
    </$AlterationAccordionItem>
  );
};

export default AlterationAccordionItem;
