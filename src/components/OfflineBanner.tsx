import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return <div role="alert" className="bg-bad px-4 py-2 text-center text-sm font-semibold text-white">You are offline. Some things may not load.</div>;
}
