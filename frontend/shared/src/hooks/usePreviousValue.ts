import React from 'react';

const usePreviousValue = <T>(value: T): T | undefined => {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePreviousValue;
