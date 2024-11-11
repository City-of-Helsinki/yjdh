import CalculationTable from 'benefit/handler/components/applicationReview/calculationTable/CalculationTable';
import useCalculationTable from 'benefit/handler/components/applicationReview/calculationTable/useCalculationTable';
import AppContext from 'benefit/handler/context/AppContext';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { IconCheckCircleFill, IconCrossCircleFill } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $HorizontalList } from '../table/TableExtras.sc';

type ApplicationReviewStepProps = {
  application: Application;
};

const CalculationReview: React.FC<ApplicationReviewStepProps> = ({
  application,
}) => {
  const { company, employee, calculation, decisionProposalDraft } = application;
  const { t } = useTranslation();
  const { handledApplication } = React.useContext(AppContext);

  const { tableRows, totalSum } = useCalculationTable({
    calculation,
  });

  if (!decisionProposalDraft) return null;

  return (
    <>
      <$GridCell $colSpan={12}>
        <Heading
          $css={{ marginTop: 0 }}
          header={t('common:review.decisionProposal.list.title')}
          as="h3"
        />
        {handledApplication.status === APPLICATION_STATUSES.ACCEPTED && (
          <p>
            {t('common:review.decisionProposal.list.text.accepted', {
              months: tableRows.at(-1)?.duration,
              startAndEndDate: `${tableRows.at(-1)?.dates}`,
            })}
          </p>
        )}
        {handledApplication.status === APPLICATION_STATUSES.REJECTED && (
          <p>{t('common:review.decisionProposal.list.text.rejected')}</p>
        )}
        <hr />
      </$GridCell>

      <$GridCell $colSpan={12}>
        <$HorizontalList css="padding-left: 0;">
          <div>
            <dt>
              {t('common:review.decisionProposal.list.proposalStatus.label')}
            </dt>
            <dd>
              {decisionProposalDraft.status ===
              APPLICATION_STATUSES.ACCEPTED ? (
                <>
                  <IconCheckCircleFill color={theme.colors.tram} />{' '}
                  {t(
                    'common:review.decisionProposal.list.proposalStatus.accepted'
                  )}
                </>
              ) : (
                <>
                  <IconCrossCircleFill color={theme.colors.brick} />{' '}
                  {t(
                    'common:review.decisionProposal.list.proposalStatus.rejected'
                  )}
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>{t('common:review.decisionProposal.list.employerName')}</dt>
            <dd>{company.name}</dd>
          </div>
          {decisionProposalDraft.status === APPLICATION_STATUSES.REJECTED && (
            <div>
              <dt>{t('common:review.decisionProposal.list.employeeName')}</dt>
              <dd>
                {employee.firstName} {employee.lastName}
              </dd>
            </div>
          )}
          {decisionProposalDraft.status === APPLICATION_STATUSES.ACCEPTED && (
            <>
              <div>
                <dt>{t('common:review.decisionProposal.list.totalAmount')}</dt>
                <dd>{formatFloatToCurrency(totalSum, 'EUR', 'fi-FI', 0)}</dd>
              </div>
              <div>
                <dt>
                  {t(
                    'common:review.decisionProposal.list.grantedAsDeMinimisAid'
                  )}
                </dt>
                <dd>
                  {decisionProposalDraft.grantedAsDeMinimisAid
                    ? t('common:utility.yes')
                    : t('common:utility.no')}
                </dd>
              </div>
            </>
          )}
          <div style={{ maxWidth: '220px', minWidth: '220px' }}>
            <dt>{t('common:review.decisionProposal.list.decisionMaker')}</dt>
            <dd>
              {handledApplication.decisionMakerName ||
                decisionProposalDraft.decisionMakerName}
            </dd>
          </div>
        </$HorizontalList>
      </$GridCell>
      {handledApplication.status === APPLICATION_STATUSES.ACCEPTED && (
        <$GridCell $colSpan={12}>
          <hr />

          <CalculationTable
            tableRows={tableRows}
            caption={t(
              'common:review.decisionProposal.calculationReview.tableCaption'
            )}
          />
        </$GridCell>
      )}
    </>
  );
};

export default CalculationReview;
