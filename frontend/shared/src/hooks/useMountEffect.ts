import React from 'react';

// run useEffect only after first render and never after that.
const useMountEffect = (func: () => void): void => {
  const initialRef = React.useRef(true);
  React.useEffect(() => {
    if (!initialRef.current) {
      return;
    }
    initialRef.current = false;
    func();
  }, [func]);
};

export default useMountEffect;
