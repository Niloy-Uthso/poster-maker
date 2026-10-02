const features = [
  { icon: "🔤", title: "Accurate Bangla text", text: "Text is rendered exactly as you type it, with no AI spelling mistakes." },
  { icon: "🖨️", title: "Print-ready quality", text: "High-resolution 2400×3200 PNG export." },
  { icon: "🖼️", title: "Up to 3 photos", text: "Add leader photos along the top of the poster." },
  { icon: "🔁", title: "Regenerate with your ideas", text: "Tell the AI what to change, like colours or decoration." },
  { icon: "📂", title: "Poster history", text: "Every poster you make is saved, so you can download it again anytime." },
  { icon: "🔒", title: "Your account", text: "Sign in to keep your posters private to you." },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-10 text-center text-3xl font-bold">Why use it</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(f => (
          <div key={f.title} className="rounded-xl bg-white p-6 shadow">
            <div className="mb-2 text-3xl">{f.icon}</div>
            <h3 className="mb-1 font-semibold">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}