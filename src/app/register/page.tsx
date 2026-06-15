'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?login=true');
  }, [router]);

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
