import { Search } from "lucide-react";

const quickStats = [
  { emoji: "⚡", label: "Electric", count: 123 },
  { emoji: "📚", label: "Tutors", count: 89 },
  { emoji: "🔧", label: "Repair", count: 67 },
  { emoji: "🏥", label: "Medical", count: 45 },
];

export default function SearchFocus() {
  return (
    <section className="bg-white py-20" id="search-focus">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-[#f9fafb] p-6 sm:p-10">
          <h2 className="font-heading text-2xl font-extrabold text-[#1e3a8a] sm:text-3xl">SEARCH ANY SERVICE IN PATNA</h2>
          <p className="mt-2 text-gray-500">Fast, Trusted, Verified</p>

          <div className="quick-stats mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickStats.map((item) => (
              <article key={item.label} className="stat-card rounded-xl bg-[#1e3a8a] p-5 text-center text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <p className="text-2xl">{item.emoji}</p>
                <p className="mt-2 text-sm font-bold">{item.label}</p>
                <p className="text-xl font-extrabold">{item.count}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <p className="mb-3 text-sm font-bold text-gray-700">Advanced Search</p>
            <div className="grid gap-3 md:grid-cols-4">
              <select className="h-11 rounded-lg border border-gray-300 px-3 text-sm">
                <option>From: Patna</option>
              </select>
              <input className="h-11 rounded-lg border border-gray-300 px-3 text-sm" defaultValue="To: Kankarbagh" />
              <select className="h-11 rounded-lg border border-gray-300 px-3 text-sm">
                <option>Within: 5 km</option>
              </select>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">
                <Search size={16} /> Find Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
