import { AxiosError } from 'axios';
import AlterationCsvButton from 'benefit/handler/components/alterationHandling/AlterationCsvButton';
import {
  $ActionContainer,
  $AlterationAccordionItem,
  $AlterationAccordionItemContainer,
  $Tag,
  $TagContainer,
  $TextAreaValue,
} from 'benefit/handler/components/applicationReview/handlingView/AlterationAccordionItem.sc';
import AlterationCancelModal from 'benefit/handler/components/applicationReview/handlingView/AlterationCancelModal';
import AlterationDeleteModal from 'benefit/handler/components/applicationReview/handlingView/AlterationDeleteModal';
import { $DecisionCalculatorAccordionIconContainer } from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import { ROUTES } from 'benefit/handler/constants';
import useDeleteApplicationAlterationQuery from 'benefit/handler/hooks/useDeleteApplicationAlterationQuery';
import useUpdateApplicationAlterationQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationQuery';
import { ErrorData } from 'benefit/handler/types/common';
import { ALTERATION_STATE, ALTERATION_TYPE } from 'benefit-shared/constants';
import { AlterationAccordionItemProps } from 'benefit-shared/types/application';
import { prettyPrintObject } from 'benefit-shared/utils/errors';
import camelcaseKeys from 'camelcase-keys';
import { Button, IconCross, IconInfoCircle, IconTrash } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
  $Hr,
} from 'shared/components/forms/section/FormSection.sc';
import hdsToast from 'shared/components/toast/Toast';
import useLocale from 'shared/hooks/useLocale';
import { convertToUIDateFormat, formatDate } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

const AlterationAccordionItem = ({
  alteration,
  application,
}: // eslint-disable-next-line sonarjs/cognitive-complexity
AlterationAccordionItemProps): JSX.Element => {
  const locale = useLocale();
  const { t } = useTranslation();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const { mutate: deleteAlteration, status: deleteStatus } =
    useDeleteApplicationAlterationQuery();
  const { mutate: updateAlteration, status: cancelStatus } =
    useUpdateApplicationAlterationQuery();

  const deletable = [
    ALTERATION_STATE.RECEIVED,
    ALTERATION_STATE.OPENED,
  ].includes(alteration.state);
  const cancellable = [ALTERATION_STATE.HANDLED].includes(alteration.state);
  const isHandled = [
    ALTERATION_STATE.HANDLED,
    ALTERATION_STATE.CANCELLED,
  ].includes(alteration.state);

  const handlerName = alteration.handledBy
    ? `${alteration.handledBy.firstName} ${alteration.handledBy.lastName[0]}.`
    : '-';
  const cancellerName = alteration.cancelledBy
    ? `${alteration.cancelledBy.firstName} ${alteration.cancelledBy.lastName[0]}.`
    : '-';

  const onActionError = (error: AxiosError<ErrorData>): void => {
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
  };

  const deleteItem = (): void => {
    deleteAlteration(
      { id: String(alteration.id), applicationId: application.id },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          return void hdsToast({
            autoDismissTime: 0,
            type: 'success',
            labelText: t('common:notifications.alterationDeleted.label'),
            text: t('common:notifications.alterationDeleted.message', {
              applicationNumber: application.applicationNumber,
            }),
          });
        },
        onError: onActionError,
      }
    );
  };

  const setItemCancelled = (): void => {
    updateAlteration(
      {
        id: alteration.id,
        applicationId: application.id,
        data: { state: ALTERATION_STATE.CANCELLED },
      },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          return void hdsToast({
            autoDismissTime: 0,
            type: 'success',
            labelText: t('common:notifications.alterationCancelled.label'),
            text: t('common:notifications.alterationCancelled.message', {
              applicationNumber: application.applicationNumber,
            }),
          });
        },
        onError: onActionError,
      }
    );
  };

  return (
    <$AlterationAccordionItemContainer>
      <$DecisionCalculatorAccordionIconContainer aria-hidden="true">
        <IconInfoCircle />
      </$DecisionCalculatorAccordionIconContainer>
      <$TagContainer>
        <$Tag
          $state={alteration.state}
          aria-hidden="true"
          data-testid="alteration-state-tag"
        >
          {t(
            `applications.decision.alterationList.item.state.${alteration.state}`
          )}
        </$Tag>
      </$TagContainer>
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
          <$GridCell className="sr-only">
            <dt>
              {t(
                'common:applications.decision.alterationList.item.state.label'
              )}
            </dt>
            <dd>
              {t(
                `applications.decision.alterationList.item.state.${alteration.state}`
              )}
            </dd>
          </$GridCell>
          {alteration.state === ALTERATION_STATE.CANCELLED && (
            <>
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.cancelledAt'
                  )}
                </dt>
                <dd>{formatDate(new Date(alteration.cancelledAt))}</dd>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.cancelledBy'
                  )}
                </dt>
                <dd>{cancellerName}</dd>
              </$GridCell>
              <$GridCell $colSpan={6} />
              <$GridCell $colSpan={12}>
                <$Hr css="margin-top: 0;" />
              </$GridCell>
            </>
          )}
          {isHandled ? (
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.handledAt'
                )}
              </dt>
              <dd>{formatDate(new Date(alteration.handledAt))}</dd>
            </$GridCell>
          ) : (
            <$GridCell $colSpan={3}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.receivedAt'
                )}
              </dt>
              <dd>{formatDate(new Date(alteration.createdAt))}</dd>
            </$GridCell>
          )}
          {isHandled && alteration.isRecoverable && (
            <>
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.handledBy'
                  )}
                </dt>
                <dd>{handlerName}</dd>
              </$GridCell>
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.recoveryAmount'
                  )}
                </dt>
                <dd>{formatFloatToCurrency(alteration.recoveryAmount, "EUR", "fi-FI", 0)}</dd>
              </$GridCell>
              <$GridCell $colSpan={3}>
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
          )}
          {isHandled && !alteration.isRecoverable && (
            <>
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.decisionResult'
                  )}
                </dt>
                <dd>
                  {t(
                    'common:applications.decision.alterationList.item.notRecoverable'
                  )}
                </dd>
              </$GridCell>
              <$GridCell $colSpan={3} />
              <$GridCell $colSpan={3}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.handledBy'
                  )}
                </dt>
                <dd>{handlerName}</dd>
              </$GridCell>
              <$GridCell $colSpan={12}>
                <dt>
                  {t(
                    'common:applications.decision.alterationList.item.noRecoveryJustification'
                  )}
                </dt>
                <$TextAreaValue>
                  {alteration.recoveryJustification || '-'}
                </$TextAreaValue>
              </$GridCell>
            </>
          )}
          {!isHandled && <$GridCell $colSpan={9} />}
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
          <$GridCell $colSpan={12}>
            <dt>
              {t(
                `common:applications.decision.alterationList.item.reason${
                  alteration.alterationType === ALTERATION_TYPE.TERMINATION
                    ? 'Termination'
                    : 'Suspension'
                }`
              )}
            </dt>
            <$TextAreaValue>{alteration.reason || '-'}</$TextAreaValue>
          </$GridCell>
          {isHandled && alteration.isRecoverable && (
            <$GridCell $colSpan={12}>
              <dt>
                {t(
                  'common:applications.decision.alterationList.item.recoveryJustification'
                )}
              </dt>
              <$TextAreaValue>
                {alteration.recoveryJustification || '-'}
              </$TextAreaValue>
            </$GridCell>
          )}
        </$Grid>
        <$ActionContainer>
          {alteration.state === ALTERATION_STATE.RECEIVED && (
            <Button
              theme="coat"
              variant="primary"
              onClick={() =>
                router.push(
                  `${ROUTES.HANDLE_ALTERATION}/?applicationId=${alteration.application}&alterationId=${alteration.id}`
                )
              }
            >
              {t(
                'common:applications.decision.alterationList.item.actions.beginHandling'
              )}
            </Button>
          )}
          {alteration.state === ALTERATION_STATE.HANDLED && (
            <AlterationCsvButton
              theme="black"
              alteration={alteration}
              secondary
            />
          )}
          {(deletable || cancellable) && (
            <Button
              theme="black"
              variant="supplementary"
              iconLeft={deletable ? <IconTrash /> : <IconCross />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {deletable
                ? t(
                    'common:applications.decision.alterationList.item.actions.delete'
                  )
                : t(
                    'common:applications.decision.alterationList.item.actions.cancel'
                  )}
            </Button>
          )}
        </$ActionContainer>
        {isDeleteModalOpen && deletable && (
          <AlterationDeleteModal
            isOpen
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={deleteItem}
            isDeleting={deleteStatus === 'loading'}
          />
        )}
        {isDeleteModalOpen && cancellable && (
          <AlterationCancelModal
            isOpen
            onClose={() => setIsDeleteModalOpen(false)}
            onSetCancelled={setItemCancelled}
            isDeleting={cancelStatus === 'loading'}
            alteration={alteration}
          />
        )}
      </$AlterationAccordionItem>
    </$AlterationAccordionItemContainer>
  );
};

export default AlterationAccordionItem;
