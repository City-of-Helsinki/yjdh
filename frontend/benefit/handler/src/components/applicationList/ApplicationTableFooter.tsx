import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';

import {
  $Column,
  $Wrapper,
} from '../applicationReview/actions/handlingApplicationActions/HandlingApplicationActions.sc';
import { $HintText, $TableFooter } from '../table/TableExtras.sc';
import InstalmentButton from './InstalmentButton';

interface TableFooterProps {
  selectedRows: string[];
  list: ApplicationListItemData[];
  isLoading: boolean;
  isLoadingStatusChange: boolean;
  translationsBase: string;
  changeInstalmentStatus: (params: {
    id?: string;
    status: INSTALMENT_STATUSES;
  }) => void;
  setIsInstalmentCancelModalShown: (show: boolean) => void;
  setIsInstalmentChangeDateDialogShown: (show: boolean) => void;
}

const ApplicationTableFooter: React.FC<TableFooterProps> = ({
  selectedRows,
  list,
  isLoading,
  isLoadingStatusChange,
  translationsBase,
  changeInstalmentStatus,
  setIsInstalmentCancelModalShown,
  setIsInstalmentChangeDateDialogShown
}) => {
  const { t } = useTranslation();

  const selectedApplication = list.find((app) => app.id === selectedRows[0]);
  const selectedInstalment =
    list.find(
      (app: ApplicationListItemData) =>
        app.id === String(selectedApplication?.id)
    )?.secondInstalment || null;

  const handleStatusChange = (status: INSTALMENT_STATUSES): void => {
    changeInstalmentStatus({
      id: selectedInstalment.id,
      status,
    });
  };

  // If no rows or multiple rows selected, show hint
  if (selectedRows.length !== 1) {
    return (
      <$TableFooter>
        <$Wrapper>
          <$Column>
            <$HintText>Valitse yksi hakemus</$HintText>
          </$Column>
        </$Wrapper>
      </$TableFooter>
    );
  }

  // If no selected application or instalment, return null
  if (!selectedApplication || !selectedInstalment) {
    return null;
  }

  return (
    <$TableFooter>
      <$Wrapper>
        <$Column>
          {/* Waiting Status Buttons */}
          {(selectedInstalment.status === INSTALMENT_STATUSES.WAITING ||
            selectedInstalment.status === INSTALMENT_STATUSES.RESPONDED) && (
            <>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.ACCEPTED)}
              >
                {t(`${translationsBase}.actions.confirm`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => setIsInstalmentCancelModalShown(true)}
              >
                {t(`${translationsBase}.actions.cancel`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.PENDING) }>
                {t(`${translationsBase}.actions.pending`)}
              </InstalmentButton>
            </>
          )}



          {/* Error in Talpa Buttons */}
          {selectedInstalment.status === INSTALMENT_STATUSES.ERROR_IN_TALPA && (
            <>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.ACCEPTED)}
              >
                {t(`${translationsBase}.actions.return_as_accepted`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.PAID)}
              >
                {t(`${translationsBase}.actions.mark_as_paid`)}
              </InstalmentButton>
            </>
          )}

          {[
            INSTALMENT_STATUSES.ACCEPTED,
          ].includes(selectedInstalment?.status as INSTALMENT_STATUSES) && (
            <>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.PENDING)}
              >
                {t(`${translationsBase}.actions.pending`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => setIsInstalmentCancelModalShown(true)}
              >
                {t(`${translationsBase}.actions.cancel`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => setIsInstalmentChangeDateDialogShown(true)}
              >
                {t(`${translationsBase}.actions.change_date`)}
              </InstalmentButton>
            </>
          )}

          {/* Return Button for Accepted/Cancelled Statuses */}
          {[
            INSTALMENT_STATUSES.CANCELLED,
          ].includes(selectedInstalment?.status as INSTALMENT_STATUSES) && (
            <InstalmentButton
              isLoading={isLoading}
              isLoadingStatusChange={isLoadingStatusChange}
              onClick={() => handleStatusChange(INSTALMENT_STATUSES.WAITING)}
            >
              {t(`${translationsBase}.actions.return`)}
            </InstalmentButton>
          )}

          {[
            INSTALMENT_STATUSES.REQUESTED,
            INSTALMENT_STATUSES.PENDING
          ].includes(selectedInstalment?.status as INSTALMENT_STATUSES) && (
            <>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => handleStatusChange(INSTALMENT_STATUSES.ACCEPTED)}
              >
                {t(`${translationsBase}.actions.confirm`)}
              </InstalmentButton>
              <InstalmentButton
                isLoading={isLoading}
                isLoadingStatusChange={isLoadingStatusChange}
                onClick={() => setIsInstalmentCancelModalShown(true)}
              >
                {t(`${translationsBase}.actions.cancel`)}
              </InstalmentButton>
            </>
          )}


        </$Column>
      </$Wrapper>
    </$TableFooter>
  );
};

export default ApplicationTableFooter;
