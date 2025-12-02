import { useNavigate } from 'react-router';

import { Button } from '@/components/button';
import { PATH } from '@/constants/path';

export function Login() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Login</h1>
      <Button onClick={() => navigate(PATH.INDEX)}>Back to Home</Button>
    </div>
  );
}
