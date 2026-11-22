import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Logo } from "@/components/logo";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-rule px-5 py-5 sm:px-10">
        <Logo />
        <nav className="flex items-center gap-5">
          <Link href="/login" className="type-stamp no-underline hover:text-terracotta">
            Sign in
          </Link>
          <Link href="/signup" className="ink-button hidden sm:inline-flex">
            Join the ledger
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[1.35fr_0.85fr] lg:py-24">
        <div>
          <p className="type-stamp">A social ledger · no single category required</p>
          <h1 className="mt-7 max-w-[760px] font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.98] tracking-[-0.045em]">
            For work that refuses to fit one label.
          </h1>
          <p className="mt-8 max-w-[560px] text-[1.05rem] leading-[1.75] text-ink-soft">
            Commonplace is a quiet, published notebook for artists, researchers, designers, writers, and everyone whose practice crosses borders. Keep the draft, the dead end, and the finished thing.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="ink-button">
              Start your ledger
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link href="/feed" className="quiet-button">
              Read the public feed
            </Link>
          </div>
          <p className="mt-8 type-stamp">Art &nbsp;·&nbsp; Work &nbsp;·&nbsp; Research &nbsp;·&nbsp; Field notes &nbsp;·&nbsp; Milestones</p>
        </div>

        <div className="paper-panel self-start px-6 py-7 sm:px-8 sm:py-9 lg:mt-10">
          <div className="flex items-start justify-between border-b border-rule pb-5">
            <div>
              <p className="type-stamp">From the ledger</p>
              <p className="mt-2 font-display text-xl">Rain ledger, plate III</p>
            </div>
            <span className="type-stamp text-terracotta">Art</span>
          </div>
          <p className="mt-6 font-display text-[1.35rem] leading-snug text-ink-soft">
            “I like when the mistake becomes the record.”
          </p>
          <p className="mt-6 text-[0.9rem] leading-relaxed text-ink-soft">
            Three weeks of rain pressed into one sheet. The blue was mixed by hand from pigment saved from an earlier failed print.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="tag-pill">#printmaking</span>
            <span className="tag-pill">#weather</span>
            <span className="tag-pill">#process</span>
          </div>
          <div className="mt-8 h-[150px] border border-rule bg-cover bg-center" style={{ backgroundImage: 'url("/seed-art/riso-blue.svg")' }} role="img" aria-label="Abstract blue risograph print" />
          <p className="mt-5 type-stamp">Maya Ibarra · @maya</p>
        </div>
      </section>

      <footer className="border-t border-rule px-5 py-6 sm:px-10">
        <p className="type-stamp">Commonplace · made for the in-between</p>
      </footer>
    </main>
  );
}
