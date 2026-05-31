import { useState, useEffect } from 'react';

// Verifica conectividade via fetch simples (sem dependência externa)
export async function isOnline(): Promise<boolean> {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); resolve(false); }, 3000);
    fetch('http://192.168.1.4:8080/api/users', { method: 'HEAD', signal: controller.signal })
      .then(() => { clearTimeout(timer); resolve(true); })
      .catch(() => { clearTimeout(timer); resolve(false); });
  });
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const status = await isOnline();
      if (!cancelled) setOnline(status);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return online;
}
