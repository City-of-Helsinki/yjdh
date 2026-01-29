import type { TextInputProps } from 'kesaseteli/employer/components/application/form/TextInput';
import React from 'react';
import Employment from 'shared/types/employment';

export type AccordionFormContextType = {
  index: number;
  closeAccordion: () => void;
  getAccordionFieldId: (field: keyof Employment) => TextInputProps['id'];
};

/**
 * Creating a context for the accordion form.
 * This is used to share the index and closeAccordion function between the accordion and the form.
 *
 * NOTE: The default values are set to 0 and a function that throws an error.
 * This is to ensure that the context is always provided by the accordion component.
 */
const EmploymentAccordionFormContext =
  React.createContext<AccordionFormContextType>({
    index: 0,
    closeAccordion: () => {
      throw new Error(
        'Not implemented. Close accordion should be provided by the accordion component.'
      );
    },
    getAccordionFieldId: (field: keyof Employment) =>
      `summer_vouchers.0.${field}`,
  });

export const EmploymentAccordionFormContextProvider: React.FC<
  AccordionFormContextType
> = ({ children, ...value }) => (
  <EmploymentAccordionFormContext.Provider value={value}>
    {children}
  </EmploymentAccordionFormContext.Provider>
);

export const useEmploymentAccordionFormContext =
  (): AccordionFormContextType => {
    const context = React.useContext(EmploymentAccordionFormContext);
    if (!context) {
      throw new Error(
        'useEmploymentAccordionFormContext must be used within an EmploymentAccordionFormContextProvider'
      );
    }
    return context;
  };

export default EmploymentAccordionFormContext;
