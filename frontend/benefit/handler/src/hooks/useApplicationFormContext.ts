import { useRouter } from 'next/router';

import { ROUTES } from '../constants';

export type APPLICATION_FORM_ACTIONS = 'edit' | 'new';

export const useApplicationFormContext = (): {
  applicationAction: APPLICATION_FORM_ACTIONS;
  isFormActionNew: boolean;
  isFormActionEdit: boolean;
} => {
  const router = useRouter();
  let applicationAction: APPLICATION_FORM_ACTIONS | null = null;
  if (ROUTES.APPLICATION_FORM_NEW === router.route) {
    applicationAction = 'new';
  }
  if (ROUTES.APPLICATION_FORM_EDIT === router.route) {
    applicationAction = 'edit';
  }

  return {
    applicationAction,
    isFormActionNew: applicationAction === 'new',
    isFormActionEdit: applicationAction === 'edit',
  };
};
