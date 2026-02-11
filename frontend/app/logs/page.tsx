'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?openLogs=1');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700 border-t-blue-500" />
    </div>
  );
}
