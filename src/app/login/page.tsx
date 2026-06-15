'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '';
    const target = redirect ? `/?login=true&redirect=${encodeURIComponent(redirect)}` : '/?login=true';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin"></div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center">
      <Suspense fallback={<div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin"></div>}>
        <LoginRedirect />
      </Suspense>
    </div>
  );
}
