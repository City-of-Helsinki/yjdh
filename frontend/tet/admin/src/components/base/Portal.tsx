import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal: React.FC = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.querySelector('#portal') as HTMLDivElement) : null;
};

export default Portal;
