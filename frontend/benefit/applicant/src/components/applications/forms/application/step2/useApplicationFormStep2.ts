import {
  APPLICATION_FIELDS_STEP2,
  DEFAULT_APPLICATION_FIELDS_STEP2,
  PAY_SUBSIDY_OPTIONS,
  // VALIDATION_MESSAGE_KEYS,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
  FormFieldsStep2,
} from 'benefit/applicant/types/application';
import { getErrorText } from 'benefit/applicant/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { TFunction } from 'next-i18next';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FieldsDef, Option } from 'shared/components/forms/fields/types';
import { IndexType, toCamelKeys, toSnakeKeys } from 'shared/utils/object.utils';
import { getBooleanValue, phoneToLocal } from 'shared/utils/string.utils';
import * as Yup from 'yup';

type ExtendedComponentProps = {
  t: TFunction;
  fieldNames: string[];
  fields: FieldsDef;
  translationsBase: string;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmitBack: () => void;
  handleSubmitNext: () => void;
  erazeCommissionFields: (e: ChangeEvent<HTMLInputElement>) => void;
  formik: FormikProps<FormFieldsStep2>;
  subsidyOptions: Option[];
  getDefaultSelectValue: (fieldName: keyof Application) => Option;
};

const useApplicationFormStep2 = (): ExtendedComponentProps => {
  const { application, setApplication } = React.useContext(ApplicationContext);
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.employee';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(2);

  const {
    mutate: updateApplication,
    data: updatedApplication,
    // todo:
    // error: updateApplicationError,
    isSuccess: isApplicationUpdated,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    if (isApplicationUpdated) {
      setApplication({
        ...(toCamelKeys(
          (updatedApplication as unknown) as IndexType
        ) as Application),
        currentStep: step,
      });
    }
  }, [isApplicationUpdated, updatedApplication, setApplication, step]);

  // transform formik plain values to object structure

  const transformFormikValues = (
    values: typeof DEFAULT_APPLICATION_FIELDS_STEP2
  ): Application => ({
      employee: {
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_FIRST_NAME]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_FIRST_NAME],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_LAST_NAME]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_LAST_NAME],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_SOCIAL_SECURITY_NUMBER]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_SOCIAL_SECURITY_NUMBER],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_PHONE_NUMBER]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_PHONE_NUMBER],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_SOCIAL_SECURITY_NUMBER]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_SOCIAL_SECURITY_NUMBER],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_JOB_TITLE]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_JOB_TITLE],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_MONTHLY_PAY]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_MONTHLY_PAY],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_VACATION_MONEY]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_VACATION_MONEY],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_OTHER_EXPENSES]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_OTHER_EXPENSES],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_WORKING_HOURS]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_WORKING_HOURS],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT]:
          values[
            APPLICATION_FIELDS_STEP2.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT
          ],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_IS_LIVING_IN_HELSINKI]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_IS_LIVING_IN_HELSINKI],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_AMOUNT]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_AMOUNT],
        [APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_DESCRIPTION]:
          values[APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_DESCRIPTION],
      },
      [APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED]:
        values[APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED],
      [APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT]:
        values[APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT],
      [APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT]:
        values[APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT],
      [APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM]:
        values[APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM],
    });

  const formik = useFormik({
    initialValues: {
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_FIRST_NAME]:
        application?.employee?.firstName || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_LAST_NAME]:
        application?.employee?.lastName || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_SOCIAL_SECURITY_NUMBER]:
        application?.employee?.socialSecurityNumber || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_PHONE_NUMBER]: phoneToLocal(
        application?.employee?.phoneNumber
      ),
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_IS_LIVING_IN_HELSINKI]:
        application?.employee?.isLivingInHelsinki || false,
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_JOB_TITLE]:
        application?.employee?.jobTitle || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_WORKING_HOURS]:
        application?.employee?.workingHours || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT]:
        application?.employee?.collectiveBargainingAgreement || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_MONTHLY_PAY]:
        application?.employee?.monthlyPay || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_OTHER_EXPENSES]:
        application?.employee?.otherExpenses || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_VACATION_MONEY]:
        application?.employee?.vacationMoney || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_DESCRIPTION]:
        application?.employee?.commissionDescription || '',
      [APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_AMOUNT]:
        application?.employee?.commissionAmount || '',
      [APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED]:
        application?.paySubsidyGranted?.toString() || '',
      [APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_PERCENT]:
        application?.paySubsidyPercent || '',
      [APPLICATION_FIELDS_STEP2.ADDITIONAL_PAY_SUBSIDY_PERCENT]:
        application?.additionalPaySubsidyPercent || '',
      [APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM]:
        application?.apprenticeshipProgram?.toString() || '',
      [APPLICATION_FIELDS_STEP2.BENEFIT_TYPE]: application?.benefitType || '',
    },
    validationSchema: Yup.object().shape({}),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      const currentApplicationData = toSnakeKeys(({
        ...application,
        ...{
          ...transformFormikValues(formik.values),
          // normalize boolean and benefit type values:
          [APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED]: getBooleanValue(
            formik.values[APPLICATION_FIELDS_STEP2.PAY_SUBSIDY_GRANTED]
          ),
          [APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM]: getBooleanValue(
            formik.values[APPLICATION_FIELDS_STEP2.APPRENTICESHIP_PROGRAM]
          ),
          [APPLICATION_FIELDS_STEP2.BENEFIT_TYPE]:
            formik.values[APPLICATION_FIELDS_STEP2.BENEFIT_TYPE],
        },
      } as unknown) as IndexType) as ApplicationData;
      updateApplication(currentApplicationData);
    },
  });

  const fieldNames = React.useMemo(
    (): string[] => Object.values(APPLICATION_FIELDS_STEP2),
    []
  );

  const subsidyOptions = React.useMemo(
    (): Option[] =>
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const fields = React.useMemo(
    (): FieldsDef =>
      fieldNames.reduce<FieldsDef>(
        (acc, name) => ({
          ...acc,
          [name]: {
            name,
            label: t(`${translationsBase}.fields.${name}.label`),
            placeholder: t(`${translationsBase}.fields.${name}.placeholder`),
          },
        }),
        {}
      ),
    [t, fieldNames]
  );

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const handleSubmit = (nextStep: number): void => {
    setIsSubmitted(true);
    setStep(nextStep);
    void formik.validateForm().then((errors) => {
      // todo: Focus the first invalid field
      const invalidFields = Object.keys(errors);
      if (invalidFields.length === 0) {
        void formik.submitForm();
      }
      return null;
    });
  };

  const handleSubmitNext = (): void => handleSubmit(3);

  const handleSubmitBack = (): void => handleSubmit(1);

  const erazeCommissionFields = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e);
    void formik.setFieldValue(
      APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_DESCRIPTION,
      ''
    );
    void formik.setFieldValue(
      APPLICATION_FIELDS_STEP2.EMPLOYEE_COMMISSION_AMOUNT,
      ''
    );
  };

  const getDefaultSelectValue = (fieldName: keyof Application): Option => (
      subsidyOptions.find(
        (o) => o.value === application?.[fieldName]?.toString()
      ) || {
        label: '',
        value: '',
      }
    );

  return {
    t,
    fieldNames,
    fields,
    translationsBase,
    formik,
    subsidyOptions,
    getDefaultSelectValue,
    getErrorMessage,
    handleSubmitNext,
    handleSubmitBack,
    erazeCommissionFields,
  };
};

export { useApplicationFormStep2 };
