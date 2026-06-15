"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const errorMsg = searchParams.get("error");

  const handleGoogleLogin = () => {
    // Redirect directly to our google auth route
    window.location.href = `/api/auth/google/login?from=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-ocean-950 via-ocean-900 to-leaf-950 px-4 py-12">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(47,78,57,0.15),transparent)]" />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10 text-center">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-light tracking-tight text-white">
            Access OCEON
          </h2>
          <p className="mt-2 text-sm text-cream-100/60">
            Sign in or create an account with a single click to manage orders and checkout.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex h-13 items-center justify-center gap-3 rounded-full bg-white hover:bg-cream-50 text-ocean-950 font-medium tracking-tight shadow-[0_10px_30px_-12px_rgba(255,255,255,0.15)] transition-all duration-300"
          >
            {/* Google Icon SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-xs text-cream-100/40">
          By continuing, you agree to our Terms of Service and Privacy Policy. We protect your account details with industry standard OAuth 2.0.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-ocean-950 via-ocean-900 to-leaf-950 px-4 py-12 text-white">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
