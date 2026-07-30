import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="pp-network-banner" role="status" aria-live="polite">
      <strong>You are offline.</strong>
      <span>AnyPetOS will keep this screen open, but cloud changes cannot save until your connection returns.</span>
    </div>
  );
}
