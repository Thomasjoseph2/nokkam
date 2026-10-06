'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '../api';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authApi.logout().catch(() => undefined);
        router.replace('/');
        router.refresh();
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
