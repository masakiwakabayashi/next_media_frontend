import { ReactNode, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import RequireAuth from "@/features/auth/components/RequireAuth";
import Providers from "@/app/providers";

export default function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <Suspense>
        <RequireAuth>
          <div className="mx-auto flex w-full max-w-5xl gap-8 px-16 py-12">
            <main className="min-w-0 flex-1">
              <Providers>{children}</Providers>
            </main>
            <div className="hidden w-64 shrink-0 lg:block">
              <Sidebar />
            </div>
          </div>
        </RequireAuth>
      </Suspense>
      <Footer />
    </>
  );
}
