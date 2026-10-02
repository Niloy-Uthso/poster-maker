import Link from "next/link";

const occasions = [
  { title: "বিজয় দিবস", sub: "Victory Day", icon: "🇧🇩", bg: "from-green-700 to-green-950" },
  { title: "শোক / স্মরণ", sub: "Condolence & Tribute", icon: "🕯️", bg: "from-gray-600 to-gray-950" },
  { title: "নির্বাচনী প্রচার", sub: "Election Campaign", icon: "🌾", bg: "from-red-700 to-red-950" },
];

export default function Occasions({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-center text-3xl font-bold">উপলক্ষ বেছে নিন</h2>
        <p className="mb-10 text-center text-gray-600">Templates for every occasion</p>
        <div className="grid gap-6 md:grid-cols-3">
          {occasions.map(o => (
            <Link key={o.title} href={ctaHref}
              className={`rounded-xl bg-gradient-to-br ${o.bg} p-8 text-center text-white shadow transition hover:-translate-y-1 hover:shadow-lg`}>
              <div className="mb-3 text-5xl">{o.icon}</div>
              <h3 className="text-2xl font-bold">{o.title}</h3>
              <p className="text-sm text-white/80">{o.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}