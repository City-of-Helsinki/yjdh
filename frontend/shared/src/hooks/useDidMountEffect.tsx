import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDidMountEffect = (func: () => void, deps: Array<any>): void => {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDidMountEffect;
