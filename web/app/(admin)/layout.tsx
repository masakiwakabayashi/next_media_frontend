import { ReactNode, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/features/auth/components/RequireAuth";
import RequireAdmin from "@/features/auth/components/RequireAdmin";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Suspense>
        <RequireAuth>
          <RequireAdmin>
            <main className="mx-auto w-full max-w-5xl px-16 py-12">
              {children}
            </main>
          </RequireAdmin>
        </RequireAuth>
      </Suspense>
      <Footer />
    </>
  );
}
