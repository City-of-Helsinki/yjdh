import parse from 'date-fns/parse';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';

import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  DateInput,
  IconAngleDown,
  IconAngleUp,
  IconArrowUndo,
  IconCheckCircleFill,
  IconCrossCircleFill,
  IconDownload,
  Table,
  TextInput,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import theme from 'shared/styles/theme';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

import { useFormik } from 'formik';

import { $Empty } from '../applicationList/ApplicationList.sc';
import {
  $HorizontalList,
  $TableBody,
  $TableFooter,
  $TableWrapper,
} from '../table/TableExtras.sc';

import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { date, object, string } from 'yup';
import { getErrorText } from 'benefit/handler/utils/forms';
import useUserQuery from 'benefit/handler/hooks/useUserQuery';
import { getFullName } from 'shared/utils/application.utils';

type ButtonAhjoStates = 'primary' | 'secondary';

type BatchProps = {
  batch: BatchProposal;
};

const $BatchStatusValue = styled.span`
  margin-left: 6px;
  margin-top: 4px;
`;

const BatchApplicationList: React.FC<BatchProps> = ({ batch }: BatchProps) => {
  const { t } = useTranslation();
  const {
    id,
    status,
    created_at,
    applications: apps,
    proposal_for_decision: proposalForDecision,
  } = batch;

  const userQuery = useUserQuery();
  const { isLoading, isSuccess, data: user } = userQuery;
  const applications = React.useMemo(() => apps, [apps]);

  const IS_DRAFT = status === BATCH_STATUSES.DRAFT;

  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [isAtAhjo, setIsAtAhjo] = React.useState<ButtonAhjoStates>('primary');
  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  const { isLoading: isDownloading, mutate: downloadBatchFiles } =
    useDownloadBatchFiles();
  const { mutate: removeApp } = useRemoveAppFromBatch();
  const { mutate: changeBatchStatus } = useBatchStatus();

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading]);

  const markBatchAs = (markBatchAsStatus: BATCH_STATUSES): void =>
    changeBatchStatus({
      id,
      status: markBatchAsStatus,
    });

  const handleBatchStatusChange = (): void => {
    if (isAtAhjo === 'primary') {
      changeBatchStatus({
        id,
        status: BATCH_STATUSES.AWAITING_FOR_DECISION,
      });
      setIsAtAhjo('secondary');
    } else {
      markBatchAs(BATCH_STATUSES.DRAFT);
      setIsAtAhjo('secondary');
    }
  };

  const handleDownloadBatchFiles = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(id);
  };

  const handleAppRemoval = (appId: string): void => {
    const selectedApp = applications.find((app) => app.id === appId);
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        `Ota hakemus ${selectedApp.application_number} pois koonnista?`
      )
    ) {
      removeApp({ appIds: [selectedApp.id], batchId: id });
    }
  };

  const cols = [
    {
      headerName: t('common:applications.list.columns.companyName'),
      key: 'company_name',
      isSortable: true,
    },
    {
      headerName: t('common:applications.list.columns.companyId'),
      key: 'business_id',
      isSortable: true,
    },
    {
      headerName: t('common:applications.list.columns.applicationNum'),
      key: 'application_number',
      isSortable: true,
    },
    {
      headerName: t(
        `common:applications.list.columns.employeeNameArchive`
      )?.toString(),
      key: 'employee_name',
      isSortable: true,
    },
    {
      headerName: t('common:applications.list.columns.handledAt'),
      key: 'handled_at',
      isSortable: true,
    },
    {
      transform: ({ id: appId }: { id: string }) =>
        IS_DRAFT ? (
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconArrowUndo />}
            onClick={() => handleAppRemoval(appId)}
          >
            {' '}
          </Button>
        ) : null,
      headerName: '',
      key: 'remove',
    },
  ];

  const proposalForDecisionHeader = (): JSX.Element => {
    if (proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED) {
      return (
        <>
          <IconCheckCircleFill color="var(--color-tram)" />
          <$BatchStatusValue>
            {`${t('common:batches.list.columns.statuses.accepted')} (${
              applications?.length
            })`}
          </$BatchStatusValue>
        </>
      );
    }
    return (
      <>
        <IconCrossCircleFill color="var(--color-brick)" />
        <$BatchStatusValue>
          {`${t('common:batches.list.columns.statuses.rejected')} (${
            applications?.length
          })`}
        </$BatchStatusValue>
      </>
    );
  };

  const footerContentDraft = (): JSX.Element => (
    <>
      <Button
        theme="black"
        variant="secondary"
        iconLeft={<IconDownload />}
        isLoading={isDownloadingAttachments}
        disabled={isDownloadingAttachments}
        loadingText={t('common:utility.loading')}
        onClick={() => handleDownloadBatchFiles()}
      >
        {t('common:batches.actions.downloadFiles')}
      </Button>
      <Button
        theme="coat"
        style={{ marginLeft: 'var(--spacing-s)' }}
        variant={isAtAhjo}
        iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
        disabled={status === BATCH_STATUSES.AWAITING_FOR_DECISION}
        className="table-custom-action"
        onClick={() => handleBatchStatusChange()}
      >
        {isAtAhjo === 'primary'
          ? t('common:batches.actions.markAsRegisteredToAhjo')
          : t('common:batches.actions.markedAsRegisteredToAhjo')}
      </Button>
    </>
  );
  const yearFromNow = new Date(new Date().getFullYear() - 1, 0, 1);

  const parseLocalizedDateString = (_: string, dateString: string) => {
    const parsed = parse(dateString, 'd.M.yyyy', new Date());
    if (isValid(parsed)) {
      return new Date(format(parsed, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }
  };

  const translationRequired = t('common:form.validation.required');
  const translationInvalidName = t('common:form.validation.name.invalid');

  const stringRequired = string()
    .matches(/^(.*)\s(\w+)/, translationInvalidName)
    .required(translationRequired);
  const schema = object({
    decision_maker_name: stringRequired,
    decision_maker_title: string().required(translationRequired),
    section_of_the_law: string()
      .matches(/^§\d+$/, t('common:batches.form.errors.section_of_the_law'))
      .required(translationRequired),
    decision_date: date()
      .min(
        yearFromNow,
        t('common:form.validation.date.min', {
          min: String(new Date().getFullYear() - 1),
        })
      )
      .transform(parseLocalizedDateString)
      .required(t('common:form.validation.date.format')),
    expert_inspector_name: stringRequired,
    expert_inspector_title: string().required(translationRequired),
  });

  const formik = useFormik<any>({
    initialValues: {
      decision_maker_name: getFullName(user?.first_name, user?.last_name),
      decision_maker_title: '',
      section_of_the_law: '§',
      decision_date: format(new Date(), 'd.M.yyyy'),
      expert_inspector_name: '',
      expert_inspector_title: '',
    },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => markBatchAs(BATCH_STATUSES.SENT_TO_TALPA),
  });

  const handleSubmit = (e): void => {
    e.preventDefault();
    void formik.validateForm().then((errs) => {
      const fieldName = Object.keys(errs);
      console.log(errs);
      console.log(formik.values);

      if (!fieldName && !errs) {
        setIsSubmitted(true);
        return formik.submitForm();
      }
    });
  };

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, true);

  const footerContentAhjo = (): JSX.Element => (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <FormSection>
          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={'t Päättäjän nimi'}
              id={`decision_maker_name_${batch.id}`}
              name="decision_maker_name"
              errorText={getErrorMessage('decision_maker_name')}
              invalid={!!formik.errors.decision_maker_name}
              value={formik.values.decision_maker_name ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={'t Päättäjän titteli'}
              id={`decision_maker_title${batch.id}`}
              name="decision_maker_title"
              errorText={getErrorMessage('decision_maker_title')}
              invalid={!!formik.errors.decision_maker_title}
              value={formik.values.decision_maker_title ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={2}>
            <TextInput
              onChange={formik.handleChange}
              label={'t pykälä'}
              id={`section_of_the_law${batch.id}`}
              name="section_of_the_law"
              errorText={getErrorMessage('section_of_the_law')}
              invalid={!!formik.errors.section_of_the_law}
              value={formik.values.section_of_the_law ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <DateInput
              minDate={yearFromNow}
              onChange={(value) => formik.setFieldValue('decision_date', value)}
              label={'t Päätöksen päivämäärä'}
              id={`decision_date${batch.id}`}
              name="decision_date"
              errorText={getErrorMessage('decision_date')}
              invalid={!!formik.errors.decision_date}
              value={formik.values.decision_date ?? ''}
              language="fi"
              required
            ></DateInput>
          </$GridCell>
        </FormSection>

        <FormSection>
          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={'t Asiantarkastajan nimi'}
              id={`expert_inspector_name${batch.id}`}
              name="expert_inspector_name"
              errorText={getErrorMessage('expert_inspector_name')}
              invalid={!!formik.errors.expert_inspector_name}
              value={formik.values.expert_inspector_name ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={'t Asiantarkastajan titteli'}
              id={`expert_inspector_title_${batch.id}`}
              name="expert_inspector_title"
              errorText={getErrorMessage('expert_inspector_title')}
              invalid={!!formik.errors.expert_inspector_title}
              value={formik.values.expert_inspector_title ?? ''}
              required
            />
          </$GridCell>
        </FormSection>

        <FormSection>
          <$GridCell $colSpan={3}>
            <Button
              disabled={isSubmitted}
              type="submit"
              theme="coat"
              variant="primary"
              // onClick={() => markBatchAs(BATCH_STATUSES.SENT_TO_TALPA)}
            >
              {proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
                ? t('common:batches.actions.markToPaymentAndArchive')
                : t('common:batches.actions.markToArchive')}
            </Button>
          </$GridCell>
          <$GridCell $colSpan={4} alignSelf="end">
            <Button
              theme="black"
              variant="supplementary"
              iconLeft={<IconArrowUndo />}
              onClick={() => markBatchAs(BATCH_STATUSES.DRAFT)}
            >
              {t('common:batches.actions.markAsWaitingForAhjo')}
            </Button>
          </$GridCell>
        </FormSection>
      </form>
    </>
  );

  return (
    <$TableWrapper>
      <$HorizontalList>
        <div>
          <dt>{t('common:batches.single')}</dt>
          <dd>{proposalForDecisionHeader()}</dd>
        </div>
        <div>
          <dt>{t('common:batches.list.columns.createdAt')}</dt>
          <dd>{convertToUIDateAndTimeFormat(created_at)}</dd>
        </div>
        <div>
          {applications.length > 0 ? (
            <button onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <IconAngleDown /> : <IconAngleUp />}
            </button>
          ) : null}
        </div>
      </$HorizontalList>
      {applications?.length ? (
        <$TableBody
          css={`
            display: ${isCollapsed ? 'none' : 'block'};
          `}
        >
          <Table
            indexKey="id"
            theme={theme.components.table}
            rows={applications}
            initialSortingColumnKey="application_number"
            initialSortingOrder="asc"
            cols={cols}
          />
          <$TableFooter>
            {IS_DRAFT ? footerContentDraft() : footerContentAhjo()}
          </$TableFooter>
        </$TableBody>
      ) : (
        <$Empty css="margin: var(--spacing-s) 0;">
          {t('common:batches.list.empty')}
        </$Empty>
      )}
    </$TableWrapper>
  );
};

export default BatchApplicationList;
