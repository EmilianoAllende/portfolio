import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (typeof window === "undefined" || !mounted) {
    return null;
  }

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    // En desarrollo, puedes crear el div si no existe, o lanzar un error.
    const newRoot = document.createElement('div');
    newRoot.id = 'portal-root';
    document.body.appendChild(newRoot);
    return createPortal(children, newRoot);
  }

  return createPortal(children, portalRoot);
};

export default Portal;