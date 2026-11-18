import Image from 'next/image';
import { Suspense } from 'react';

import { LoginForm } from '@/app/_components/login-form';
import { Header } from '@/components/layout/header';
import { PageGrid } from '@/components/layout/page-grid';
import { getServerAuthSession } from '@/lib/auth/cookies';

async function SessionLoginForm() {
  const { role } = await getServerAuthSession();

  return <LoginForm initialRole={role} />;
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header />

      <main className="flex flex-1 items-center py-12">
        <PageGrid className="h-full flex-1 items-center">
          <div className="col-span-8 flex w-full max-w-[470px] flex-col items-center gap-8 justify-self-center min-[1280px]:col-span-4 min-[1280px]:col-start-3">
            <div aria-hidden="true" className="flex size-45 shrink-0 items-center justify-center">
              <Image alt="" height={90} priority src="/admin/logo_favicon.svg" width={109} />
            </div>

            <Suspense fallback={null}>
              <SessionLoginForm />
            </Suspense>
          </div>
        </PageGrid>
      </main>
    </div>
  );
}
