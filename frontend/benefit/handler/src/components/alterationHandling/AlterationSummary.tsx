import { $AlterationDetails } from 'benefit/handler/components/alterationHandling/AlterationHandling.sc';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { formatDate } from 'shared/utils/date.utils';

type Props = {
  alteration: ApplicationAlteration;
  application: Application;
};

const AlterationSummary: React.FC<Props> = ({ alteration, application }) => {
  const translationBase = 'common:applications.alterations.handling';
  const { t } = useTranslation();

  return (
    <$AlterationDetails>
      <div>
        <dt>{t(`${translationBase}.summary.type.label`)}</dt>
        <dd>
          {t(`${translationBase}.summary.type.${alteration.alterationType}`)}
        </dd>
      </div>
      <div>
        <dt>{t(`${translationBase}.summary.endDate`)}</dt>
        <dd>{formatDate(new Date(alteration.endDate))}</dd>
      </div>
      <div>
        {alteration.alterationType === ALTERATION_TYPE.SUSPENSION && (
          <>
            <dt>{t(`${translationBase}.summary.resumeDate`)}</dt>
            <dd>{formatDate(new Date(alteration.resumeDate))}</dd>
          </>
        )}
      </div>
      <div />
      <div>
        <dt>{t(`${translationBase}.summary.contactPerson`)}</dt>
        <dd>{alteration.contactPersonName}</dd>
      </div>
      {alteration.useEinvoice ? (
        <>
          <div>
            <dt>{t(`${translationBase}.summary.einvoiceProviderName`)}</dt>
            <dd>{alteration.einvoiceProviderName}</dd>
          </div>
          <div>
            <dt>
              {t(`${translationBase}.summary.einvoiceProviderIdentifier`)}
            </dt>
            <dd>{alteration.einvoiceProviderIdentifier}</dd>
          </div>
          <div>
            <dt>{t(`${translationBase}.summary.einvoiceAddress`)}</dt>
            <dd>{alteration.einvoiceAddress}</dd>
          </div>
        </>
      ) : (
        <>
          <div>
            <dt>{t(`${translationBase}.summary.billingAddress`)}</dt>
            <dd>
              {application.company.streetAddress},{' '}
              {application.company.postcode} {application.company.city}
            </dd>
          </div>
          <div />
          <div />
        </>
      )}
      <div>
        <dt>
          {alteration.alterationType === ALTERATION_TYPE.TERMINATION
            ? t(`${translationBase}.summary.reasonTermination`)
            : t(`${translationBase}.summary.reasonSuspension`)}
        </dt>
        <dd>{alteration.reason || '-'}</dd>
      </div>
    </$AlterationDetails>
  );
};

export default AlterationSummary;
