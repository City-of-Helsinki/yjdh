import React from 'react';

/** Returns [isOpen, toggle] for the application detail sidebar. */
const useSidebarState = (): [boolean, () => void] => {
  const [isOpen, setIsOpen] = React.useState(false); // closed by default
  const toggle = (): void => setIsOpen((prev) => !prev);
  return [isOpen, toggle];
};

export default useSidebarState;
