import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PORTAL_ID from 'shared/constants/portal-id';

const Portal: React.FC = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 1. If we aren't mounted yet (Server-side or first render), return null immediately.
  // This prevents the code below from ever touching 'document' on the server.
  if (!mounted) return null;

  // 2. Now it's safe to use document because we know we're in the browser.
  const portalRoot = document.querySelector(`#${PORTAL_ID}`);

  return portalRoot ? createPortal(children, portalRoot) : null;
};

export default Portal;
