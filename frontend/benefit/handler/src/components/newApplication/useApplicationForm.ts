import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_FIELDS,
} from 'benefit/handler/constants';
import useApplicationQueryWithState from 'benefit/handler/hooks/useApplicationQueryWithState';
import useFormActions from 'benefit/handler/hooks/useFormActions';
import {
  StepActionType,
  StepStateType,
  useSteps,
} from 'benefit/handler/hooks/useSteps';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import {
  ORGANIZATION_TYPES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import {
  ApplicationData,
  DeMinimisAid,
} from 'benefit-shared/types/application';
import { FormikProps, useFormik } from 'formik';
import { NextRouter, useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { BenefitAttachment } from 'shared/types/attachment';
import { OptionType } from 'shared/types/common';
import { invertBooleanArray } from 'shared/utils/array.utils';
import { formatDate, parseDate } from 'shared/utils/date.utils';
import { focusAndScroll } from 'shared/utils/dom.utils';

import {
  errorToast,
  getApplication,
  getDates,
  getFields,
  getSubsidyOptions,
  handleErrorFieldKeys,
  requiredAttachments,
} from './utils/applicationForm';
import { getValidationSchema } from './utils/validation';

type ExtendedComponentProps = {
  id: string | null;
  t: TFunction;
  isConfirmationModalOpen: boolean;
  setIsConfirmationModalOpen: React.Dispatch<boolean>;
  translationsBase: string;
  router: NextRouter;
  application: Application;
  formik: FormikProps<Partial<Application>>;
  fields: ApplicationFields;
  handleSaveDraft: () => void;
  handleDelete: () => void;
  handleSave: () => void;
  handleQuietSave: () => Promise<ApplicationData | void>;
  handleSubmit: () => void;
  showDeminimisSection: boolean;
  minEndDate: Date;
  maxEndDate: Date | undefined;
  setEndDate: () => void;
  getSelectValue: (fieldName: keyof Application) => OptionType | null;
  subsidyOptions: OptionType[];
  deMinimisAidSet: DeMinimisAid[];
  attachments: BenefitAttachment[];
  dispatchStep: React.Dispatch<StepActionType>;
  stepState: StepStateType;
  isLoading: boolean;
  checkedConsentArray: boolean[];
  getConsentErrorText: (consentIndex: number) => string;
  handleConsentClick: (consentIndex: number) => void;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const useApplicationForm = (): ExtendedComponentProps => {
  const translationsBase = 'common:applications.actions';
  const tSections = 'common:applications.sections';
  const tNotifications = 'common:applications.sections.notifications';
  const { t } = useTranslation();
  const router = useRouter();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    React.useState(false);
  const id = router?.query?.id?.toString() ?? null;
  const [isLoading, setIsLoading] = React.useState<boolean>(!!id);
  const { stepState, dispatchStep, activeStep } = useSteps(id);
  let organizationType = 'company';

  React.useEffect(() => {
    if (id) {
      dispatchStep({ type: 'setActive', payload: 2 });
    }
  }, [id, dispatchStep]);

  const [application, setApplication] = React.useState<Application>(
    getApplication({} as ApplicationData)
  );
  const {
    status: applicationDataStatus,
    data: applicationData,
    error: applicationDataError,
  } = useApplicationQueryWithState(id, setApplication);

  React.useEffect(() => {
    if (applicationDataError) {
      errorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text'),
        5000
      );
    }
    if (
      id &&
      applicationDataStatus !== 'idle' &&
      applicationDataStatus !== 'loading'
    ) {
      setIsLoading(false);
    }
  }, [t, applicationDataError, applicationDataStatus, id, applicationData]);

  organizationType = application.company?.organizationType ?? 'company';

  const { onSave, onQuietSave, onSubmit, onNext, onDelete } =
    useFormActions(application);

  const formik = useFormik({
    initialValues: {
      ...application,
      [APPLICATION_FIELDS.START_DATE]: application.startDate
        ? formatDate(parseDate(application.startDate))
        : undefined,
      [APPLICATION_FIELDS.END_DATE]: application.endDate
        ? formatDate(parseDate(application.endDate))
        : undefined,
      [APPLICATION_FIELDS.PAPER_APPLICATION_DATE]:
        application.paperApplicationDate
          ? formatDate(parseDate(application.paperApplicationDate))
          : undefined,
    },
    validationSchema: getValidationSchema(organizationType, t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: (values) => onNext(values, dispatchStep, activeStep, id),
  });

  const { values, setFieldValue } = formik;

  const fields = React.useMemo(() => getFields(t, tSections), [t, tSections]);

  const isRequiredAttachmentsUploaded = (): boolean =>
    requiredAttachments(values);

  const getInitialConsentValues = (): boolean[] =>
    application?.applicantTermsInEffect?.applicantConsents.map(() => false) ||
    [];

  const [checkedConsentArray, setCheckedConsentArray] = React.useState<
    boolean[]
  >(getInitialConsentValues());

  const [consentErrorsArray, setConsentErrorsArray] = React.useState<boolean[]>(
    getInitialConsentValues()
  );

  const getConsentErrors = (): boolean => {
    setConsentErrorsArray(invertBooleanArray(checkedConsentArray));
    return checkedConsentArray.some((c) => !c);
  };

  const handleQuietSave = async (): Promise<ApplicationData | void> =>
    onQuietSave(values, id);

  const handleSaveDraft = async (): Promise<void> => {
    await onSave(values, id);
  };
  const handleDelete = (): void => {
    onDelete(application.id ?? '');
  };

  const handleSave = async (): Promise<void> =>
    formik.validateForm().then((errs): Promise<void> | void => {
      let errorFieldKey = Object.keys(errs)[0] as
        | APPLICATION_FIELD_KEYS
        | APPLICATION_FIELD_KEYS.EMPLOYEE;

      if (errorFieldKey) {
        errorFieldKey = handleErrorFieldKeys(errorFieldKey, errs);
        return focusAndScroll(errorFieldKey);
      }

      if (!isRequiredAttachmentsUploaded()) {
        return errorToast(
          t(`${tNotifications}.requiredAttachments.label`),
          t(`${tNotifications}.requiredAttachments.content`)
        );
      }

      if (getConsentErrors()) {
        return errorToast(
          t(`${tNotifications}.requiredConsents.label`),
          t(`${tNotifications}.requiredConsents.content`)
        );
      }

      return formik.submitForm();
    });

  const handleSubmit = async (): Promise<void> => {
    await onSubmit(values, id);
  };

  const showDeminimisSection =
    values.associationHasBusinessActivities === true ||
    organizationType !== ORGANIZATION_TYPES.ASSOCIATION;

  const { minEndDate, minEndDateFormatted, maxEndDate, isEndDateEligible } =
    getDates(values);

  const setEndDate = React.useCallback(() => {
    if (!values.startDate && values.endDate) {
      void setFieldValue(fields.endDate.name, '');
    } else if (values.startDate && !isEndDateEligible) {
      void setFieldValue(fields.endDate.name, minEndDateFormatted);
    }
  }, [
    values.startDate,
    values.endDate,
    fields.endDate.name,
    isEndDateEligible,
    minEndDateFormatted,
    setFieldValue,
  ]);

  const subsidyOptions = React.useMemo(getSubsidyOptions, []);

  const getSelectValue = (fieldName: keyof Application): OptionType | null =>
    subsidyOptions.find(
      (o) => o.value?.toString() === String(values?.[fieldName])
    ) ?? null;

  if (getInitialConsentValues().length !== checkedConsentArray.length) {
    setCheckedConsentArray(getInitialConsentValues());
  }

  if (getInitialConsentValues().length !== consentErrorsArray.length) {
    setConsentErrorsArray(getInitialConsentValues());
  }

  const handleConsentClick = (consentIndex: number): void => {
    const newValue = !checkedConsentArray[consentIndex];
    const newArray = [
      ...checkedConsentArray.slice(0, consentIndex),
      newValue,
      ...checkedConsentArray.slice(consentIndex + 1),
    ];
    setCheckedConsentArray(newArray);
    const newErrorsArray = [...consentErrorsArray];
    newErrorsArray[consentIndex] = !newArray[consentIndex];
    setConsentErrorsArray(newErrorsArray);
  };

  const getConsentErrorText = (consentIndex: number): string =>
    consentErrorsArray[consentIndex] ? t(VALIDATION_MESSAGE_KEYS.REQUIRED) : '';

  return {
    t,
    id,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    translationsBase,
    router,
    application,
    formik,
    fields,
    handleSave,
    handleQuietSave,
    handleSubmit,
    handleSaveDraft,
    handleDelete,
    showDeminimisSection,
    minEndDate,
    maxEndDate,
    setEndDate,
    getSelectValue,
    subsidyOptions,
    deMinimisAidSet: application.deMinimisAidSet || [],
    attachments: (application.attachments || []) as BenefitAttachment[],
    dispatchStep,
    stepState,
    isLoading,
    checkedConsentArray,
    getConsentErrorText,
    handleConsentClick,
  };
};
