import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PORTAL_ID from 'shared/contants/portal-id';

const Portal: React.FC = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.querySelector(`#${PORTAL_ID}`))
    : null;
};

export default Portal;
