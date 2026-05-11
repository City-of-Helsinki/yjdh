import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const getDialog = (): HTMLElement => screen.getByRole('dialog');

export const getDialogButton = (name: string | RegExp): HTMLElement =>
  within(getDialog()).getByRole('button', { name });

export const clickDialogButton = async (
  name: string | RegExp,
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name }));
};
