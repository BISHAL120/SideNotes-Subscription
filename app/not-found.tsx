import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-black text-neutral-900 mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-neutral-500 mb-6 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved to another location.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-md bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
