export const focusAndScroll = (elementId: string | undefined): void => {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const element = elementId ? document.getElementById(elementId) : null;

  if (!element) {
    return window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  element.focus({ preventScroll: true });

  const offset = 50;
  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = element.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;
  const offsetPosition = elementPosition - offset;

  return window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
};
