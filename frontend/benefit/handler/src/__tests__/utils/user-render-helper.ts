import userEvent from '@testing-library/user-event';

export const setupUserAndRender = (
  renderFn: () => void
): ReturnType<typeof userEvent.setup> => {
  const user = userEvent.setup();
  renderFn();
  return user;
};
