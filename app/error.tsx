'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error-boundary]', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-neutral-900 mb-2">Something went wrong</h2>
      <p className="text-xs text-neutral-500 mb-2 max-w-md">
        We could not load this page. Please try again — if the problem continues, contact support
        with the reference below.
      </p>
      {error.digest && (
        <p className="text-[11px] text-neutral-400 font-mono mb-6">Reference: {error.digest}</p>
      )}
      {process.env.NODE_ENV !== 'production' && (
        <pre className="text-left text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-md bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-md bg-[#F58220] text-white text-xs font-bold hover:bg-[#E66D10] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
