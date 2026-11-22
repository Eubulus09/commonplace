import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-10">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between border-b border-rule pb-5">
        <Logo />
        <Link href="/" className="type-stamp no-underline hover:text-terracotta">
          Back to the beginning
        </Link>
      </header>
      <div className="mx-auto flex max-w-[1180px] justify-center py-12 sm:py-20">{children}</div>
    </main>
  );
}
