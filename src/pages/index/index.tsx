import { useEffect } from 'react';

import { Button } from '@/components/button';

export function Index() {
  useEffect(() => {
    const unsubscribePong = window.goApi.pongEventListener((event) => {
      console.log(event);
    });
    const unsubscribeStatus = window.goApi.statusEventListener((event) => {
      console.log('status', event);
    });
    return () => {
      unsubscribePong();
      unsubscribeStatus();
    };
  }, []);

  return (
    <div>
      <h1 className="title">Index</h1>
      <Button onClick={() => window.goApi.ping()}>Ping</Button>
    </div>
  );
}
