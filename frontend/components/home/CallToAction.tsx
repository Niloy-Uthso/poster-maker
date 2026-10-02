import Link from "next/link";

export default function CallToAction({ ctaHref, ctaText }: { ctaHref: string; ctaText: string }) {
  return (
    <section className="bg-brand py-14 text-center text-white">
      <h2 className="mb-3 text-3xl font-bold">আপনার পোস্টার তৈরি করতে প্রস্তুত?</h2>
      <p className="mb-6 text-green-100">Ready to make your poster?</p>
      <Link href={ctaHref} className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-brand hover:bg-green-50">{ctaText}</Link>
    </section>
  );
}