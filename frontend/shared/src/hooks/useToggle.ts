import React from 'react';

const toggle = (previous: boolean): boolean => !previous;

const useToggle = (initialValue?: boolean): [boolean, () => void] =>
  React.useReducer(toggle, Boolean(initialValue));

export default useToggle;
