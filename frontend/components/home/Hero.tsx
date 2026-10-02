import Link from "next/link";

export default function Hero({ ctaHref, ctaText }: { ctaHref: string; ctaText: string }) {
  return (
    <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">মিনিটেই তৈরি করুন আপনার পোস্টার</h1>
          <p className="mt-4 max-w-md text-lg text-green-100">
            Create print-ready Bangla political posters for victory days, tributes and campaigns. No design skills needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ctaHref} className="rounded-lg bg-white px-6 py-3 font-semibold text-brand hover:bg-green-50">{ctaText}</Link>
            <a href="#how" className="rounded-lg border border-white/70 px-6 py-3 font-semibold hover:bg-white/10">How it works</a>
          </div>
        </div>

        <div className="mx-auto w-64 rotate-2 rounded-2xl border-4 border-yellow-300 bg-gradient-to-br from-red-700 to-green-900 p-4 shadow-2xl md:w-72">
          <div className="mb-3 flex justify-center gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-20 w-16 rounded-t-full border-2 border-yellow-300 bg-black/30" />)}
          </div>
          <p className="text-center text-2xl font-extrabold">মহান বিজয় দিবস</p>
          <div className="mt-4 rounded-lg bg-black/40 p-2 text-center text-sm">
            <p className="font-bold">আপনার নাম</p>
            <p className="text-xs text-yellow-200">পদবি — সংগঠন</p>
          </div>
        </div>
      </div>
    </section>
  );
}