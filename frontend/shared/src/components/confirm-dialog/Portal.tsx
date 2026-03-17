import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PORTAL_ID from 'shared/constants/portal-id';

const Portal: React.FC = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  const portalRoot = document.querySelector(`#${PORTAL_ID}`);
  return portalRoot ? createPortal(children, portalRoot) : null;
};

export default Portal;
