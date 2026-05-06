import React from 'react';
import { useWatch } from 'react-hook-form';
import Application from 'shared/types/application-form-data';

/**
 * Checks if the given bank account number is foreign.
 * @param bankAccountNumber The bank account number to check.
 * @returns True if the bank account number is foreign, false otherwise.
 */
export function getIsForeignIban(bankAccountNumber: string): boolean {
  if (!bankAccountNumber || bankAccountNumber.length < 2) {
    return false;
  }
  return !bankAccountNumber.startsWith('FI');
}

/**
 * Hook to check if the given bank account number is foreign.
 * @returns True if the bank account number is foreign, false otherwise.
 */
function useIsForeignIban(): boolean {
  const bankAccountNumber = useWatch<Application, 'bank_account_number'>({
    name: 'bank_account_number',
  });

  return React.useMemo(
    () => getIsForeignIban(bankAccountNumber),
    [bankAccountNumber]
  );
}

export default useIsForeignIban;
