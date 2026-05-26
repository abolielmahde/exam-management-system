import React from 'react';
import { useEffect, useState } from 'react';

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const listener = event => {
      setToast(event.detail);
      window.setTimeout(() => setToast(null), 2500);
    };

    window.addEventListener('app-notify', listener);
    return () => window.removeEventListener('app-notify', listener);
  }, []);

  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}
