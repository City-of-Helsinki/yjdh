import { $AlterationAccordionItem } from 'benefit/applicant/components/applications/alteration/AlterationAccordionItem.sc';
import AlterationDeleteModal from 'benefit/applicant/components/applications/alteration/AlterationDeleteModal';
import useDeleteApplicationAlterationQuery from 'benefit/applicant/hooks/useDeleteApplicationAlterationQuery';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import { AlterationAccordionItemProps } from 'benefit-shared/types/application';
import { prettyPrintObject } from 'benefit-shared/utils/errors';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconTrash } from 'hds-react';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import hdsToast from 'shared/components/toast/Toast';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

const AlterationAccordionItem = ({
  alteration,
  application,
}: AlterationAccordionItemProps): JSX.Element => {
  const locale = useLocale();
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const { mutate: deleteAlteration, status: deleteStatus } =
    useDeleteApplicationAlterationQuery();

  const deleteItem = (): void => {
    deleteAlteration(
      { id: String(alteration.id), applicationId: application.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          return void hdsToast({
            autoDismissTime: 0,
            type: 'success',
            labelText: t(
              `common:notifications.alterationDeleted.label${
                alteration.alterationType === ALTERATION_TYPE.TERMINATION
                  ? 'Termination'
                  : 'Suspension'
              }`
            ),
            text: t('common:notifications.alterationDeleted.message'),
          });
        },
        onError: (error) => {
          const errorData = camelcaseKeys(error.response?.data ?? {});
          const isContentTypeHTML = typeof errorData === 'string';

          void hdsToast({
            autoDismissTime: 0,
            type: 'error',
            labelText: t('common:notifications.applicationDeleteError.label'),
            text:
              isContentTypeHTML || Object.keys(errorData).length === 0
                ? t('common:error.generic.text')
                : Object.entries(errorData).map(([key, value]) =>
                    typeof value === 'string' ? (
                      <span key={key}>{value}</span>
                    ) : (
                      prettyPrintObject({ data: value })
                    )
                  ),
          });
        },
      }
    );
  };

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
              <dd>{formatFloatToEvenEuros(alteration.recoveryAmount)}</dd>
            </$GridCell>
            <$GridCell $colSpan={6}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.recoveryPeriod'
                )}
              </dt>
              <dd>
                {convertToUIDateFormat(alteration.recoveryStartDate)}–
                {convertToUIDateFormat(alteration.recoveryEndDate)}
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
      {alteration.state === ALTERATION_STATE.RECEIVED && (
        <Button
          theme="black"
          variant="secondary"
          iconLeft={<IconTrash />}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          {t('common:applications.decision.alterationList.item.actions.delete')}
        </Button>
      )}
      {isDeleteModalOpen && (
        <AlterationDeleteModal
          isOpen
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={deleteItem}
          alteration={alteration}
          isDeleting={deleteStatus === 'loading'}
        />
      )}
    </$AlterationAccordionItem>
  );
};

export default AlterationAccordionItem;
