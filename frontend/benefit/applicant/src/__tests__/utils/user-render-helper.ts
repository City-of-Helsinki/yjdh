import userEvent from '@testing-library/user-event';

/**
 * Combines user event setup with rendering.
 * Reduces boilerplate when both setup and render are needed.
 *
 * Usage:
 *   const user = setupUserAndRender(() => renderForm());
 *   await user.click(screen.getByRole('button'));
 */
export const setupUserAndRender = (
  renderFn: () => void
): ReturnType<typeof userEvent.setup> => {
  const user = userEvent.setup();
  renderFn();
  return user;
};
