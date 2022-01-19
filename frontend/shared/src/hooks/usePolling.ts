import noop from 'lodash/noop';
import React, { useEffect } from 'react';

const usePolling = (callback: () => void, delay: number): void => {
  const savedCallback = React.useRef(noop);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = (): void => {
      savedCallback.current();
    };
    if (delay) {
      const id = setInterval(tick, delay);
      return (): void => clearInterval(id);
    }
    return () => {};
  }, [callback, delay]);
};

export default usePolling;
