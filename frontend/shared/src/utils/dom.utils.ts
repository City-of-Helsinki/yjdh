const handleScroll = (element?: HTMLElement): void => {
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

/**
 * Focus and scroll to element using it's id
 * @param elementId
 * @returns void
 */
export const focusAndScroll = (elementId: string): void => {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const element = document.getElementById(elementId);
  return handleScroll(element);
};

/**
 * Focus and scroll to any element using querySelector
 * @param elementSelector
 * @returns void
 */
export const focusAndScrollTo = (elementSelector: string): void => {
  const element = document.querySelector(elementSelector);
  return handleScroll(element as HTMLElement);
};
