import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageGridProps {
  children: ReactNode;
  className?: string;
}

export function PageGrid({ children, className }: PageGridProps) {
  return (
    <div className={cn('mx-auto grid w-full max-w-[1808px] grid-cols-8 gap-6 px-6', className)}>
      {children}
    </div>
  );
}
