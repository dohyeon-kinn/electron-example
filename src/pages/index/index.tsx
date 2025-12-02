import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/button';
import { PATH } from '@/constants/path';

export function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribePong = window.goApi.pongEventListener((event) => {
      console.log(event);
    });
    const unsubscribeStatus = window.goApi.statusEventListener((event) => {
      console.log('status', event);
    });
    const unsubscribeStatus2 = window.goApi.statusEventListener((event) => {
      console.log('status2', event);
    });
    return () => {
      unsubscribePong();
      unsubscribeStatus();
      unsubscribeStatus2();
    };
  }, []);

  return (
    <div>
      <h1>Index</h1>
      <Button onClick={() => window.goApi.ping()}>Ping</Button>
      <Button onClick={() => navigate(PATH.LOGIN)}>Go to Login</Button>
    </div>
  );
}
