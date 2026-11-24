import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InviteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md px-6 py-12">{children}</main>
      <Footer />
    </>
  );
}
