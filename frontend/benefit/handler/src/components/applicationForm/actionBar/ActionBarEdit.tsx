import { ROUTES } from 'benefit/handler/constants';
import { useApplicationFormContext } from 'benefit/handler/hooks/useApplicationFormContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { FormikProps } from 'formik';
import {
  Button,
  Dialog,
  IconArrowRight,
  IconSaveDiskette,
  TextArea,
} from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';

import { $ButtonContainer } from '../ApplicationForm.sc';
import { useFormContent } from '../formContent/useFormContent';
import ReviewEditChanges from '../reviewChanges/ReviewEditChanges';

type ActionBarProps = {
  handleSave: () => void;
  handleValidation: () => Promise<boolean>;
  id: string | string[] | undefined;
  formik: FormikProps<Partial<Application>>;
  fields: ApplicationFields;
  initialApplication: Application;
};

const ActionBarEdit: React.FC<ActionBarProps> = ({
  handleSave,
  handleValidation,
  id,
  formik,
  fields,
  initialApplication,
}: ActionBarProps) => {
  const { t } = useTranslation();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const translationsBase = 'common:applications.actions';
  const router = useRouter();

  const { getErrorMessage } = useFormContent(formik, fields);

  const { isFormActionEdit, isFormActionNew } = useApplicationFormContext();

  return (
    <>
      <$Grid>
        <$GridCell $colSpan={6}>
          <$ButtonContainer>
            {handleValidation && (
              <Button
                theme="coat"
                onClick={() =>
                  handleValidation().then((isValid: boolean) =>
                    isValid ? setIsConfirmationModalOpen(true) : null
                  )
                }
                iconRight={
                  isFormActionNew ? <IconArrowRight /> : <IconSaveDiskette />
                }
                data-testid="nextButton"
              >
                {t(`${translationsBase}.continue`)}
              </Button>
            )}
            {isFormActionEdit && (
              <Button
                css={{ marginLeft: 'var(--spacing-s)' }}
                theme="black"
                variant="secondary"
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  const alert = formik.dirty && !window.confirm();

                  if (!alert) {
                    return void router.push(
                      `${ROUTES.APPLICATION}?id=${String(id)}`
                    );
                  }
                  return null;
                }}
                data-testid="cancelButton"
              >
                {t(`${translationsBase}.cancel`)}
              </Button>
            )}
          </$ButtonContainer>
        </$GridCell>
      </$Grid>

      {isConfirmationModalOpen && handleSave && (
        <Modal
          theme={theme.components.modal.coat}
          id="ActionBar-confirmEditApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(`common:applications.dialog.edit.heading`)}
          submitButtonLabel={t(`${translationsBase}.save`)}
          cancelButtonLabel={t(`${translationsBase}.backWithoutBack`)}
          handleToggle={() => setIsConfirmationModalOpen(false)}
          handleSubmit={noop}
          customContent={
            <>
              <Dialog.Content>
                <$Grid>
                  <$GridCell $colSpan={12}>
                    <ReviewEditChanges
                      initialValues={initialApplication}
                      currentValues={formik.values}
                    />
                    <hr />
                  </$GridCell>
                  <$GridCell $colSpan={12}>
                    <p>{t(`common:applications.dialog.edit.helperText`)}</p>
                    <TextArea
                      id={fields.changeReason.name}
                      name={fields.changeReason.name}
                      label={fields.changeReason.label}
                      onChange={formik.handleChange}
                      value={formik.values.changeReason}
                      invalid={
                        formik.touched.changeReason &&
                        (!formik.values.changeReason ||
                          formik.values.changeReason === '')
                      }
                      aria-invalid={!!getErrorMessage(fields.changeReason.name)}
                      errorText={getErrorMessage(fields.changeReason.name)}
                      required
                    />
                  </$GridCell>
                </$Grid>
              </Dialog.Content>
              <Dialog.ActionButtons>
                <Button
                  theme="coat"
                  variant="primary"
                  disabled={
                    !formik.values.changeReason ||
                    formik.values.changeReason === ''
                  }
                  onClick={handleSave}
                  data-testid="confirm-ok"
                >
                  {t(`${translationsBase}.save`)}
                </Button>
                <Button
                  theme="black"
                  variant="secondary"
                  onClick={() => setIsConfirmationModalOpen(false)}
                  data-testid="confirm-cancel"
                >
                  {t('common:utility.cancel')}
                </Button>
              </Dialog.ActionButtons>
            </>
          }
        />
      )}
    </>
  );
};

export default ActionBarEdit;
