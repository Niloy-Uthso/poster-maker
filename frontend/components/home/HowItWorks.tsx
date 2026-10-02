const steps = [
  { icon: "📝", title: "তথ্য দিন", text: "Pick an occasion, write your Bangla headline, add your name, designation and photos." },
  { icon: "🤖", title: "AI ডিজাইন করবে", text: "AI chooses colours and decoration that fit the occasion. Your text is placed exactly as you typed it." },
  { icon: "⬇️", title: "ডাউনলোড করুন", text: "Preview it, ask for changes if needed, and download a print-ready PNG." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-2 text-center text-3xl font-bold">কীভাবে কাজ করে</h2>
      <p className="mb-10 text-center text-gray-600">Three simple steps</p>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-green-50 text-2xl">{s.icon}</div>
            <p className="text-sm font-semibold text-brand">Step {i + 1}</p>
            <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
            <p className="text-gray-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}