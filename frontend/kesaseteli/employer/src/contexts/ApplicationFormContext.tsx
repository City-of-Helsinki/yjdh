
import React from 'react'
import { UseFormReturn } from 'react-hook-form';
import Application from 'shared/types/employer-application';

export type FormContextProps = {
  translate: (field: keyof Application) => string;
  translateError: (field: keyof Application) => string;
} &
  UseFormReturn<Application>;

let ApplicationFormContext: React.Context<FormContextProps>;

export const getApplicationFormContext = (): React.Context<FormContextProps> => {
  if (!ApplicationFormContext) {
    throw new Error('ApplicationFormContext is not initialized!');
  }
  return ApplicationFormContext;
};

export const setApplicationFormContext = (context: FormContextProps): void => {
  ApplicationFormContext = React.createContext<FormContextProps>(context);
  ApplicationFormContext.displayName = 'ApplicationFormContext';
};
