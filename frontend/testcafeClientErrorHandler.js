/**
 * ResizeObserver throws error to browser's console. That upsets testcafe that
 * fails the running test. According to this conversation, ResizeObserver error
 * can be safely ignored:
 * https://github.com/DevExpress/testcafe/issues/4857#issuecomment-598775956
 */
window.addEventListener('error', (e) => {
  if (
    [
      'ResizeObserver loop completed with undelivered notifications.',
      'ResizeObserver loop limit exceeded',
      /* add more if needed */
    ].includes(e.message)
  ) {
    e.stopImmediatePropagation();
  }
});
