"use client";

import { businesses as seedBusinesses } from "@/lib/businessData";
import { getAdminHeaders } from "@/lib/adminFetch";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Users,
  Clock,
  MapPin
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

type PendingRow = {
  id: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  ownerEmail: string;
  status: string;
  photoUrls?: string[];
  experience?: string;
};

export default function AdminBusinesses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"queue" | "catalog">("queue");
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/businesses/pending", { headers: await getAdminHeaders() });
    if (res.ok) {
      const data = (await res.json()) as { businesses: PendingRow[] };
      setPending(data.businesses);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPending();
  }, []);

  const act = async (businessId: string, action: "approve" | "reject") => {
    const h = await getAdminHeaders();
    const res = await fetch("/api/admin/businesses/pending", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ businessId, action }),
    });
    if (res.ok) void loadPending();
  };

  const filteredSeed = seedBusinesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-navy italic">Managed providers</h2>
          <p className="text-sm font-medium text-gray-400 italic">Review incoming applications from across Jamshedpur.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative flex p-1 rounded-2xl bg-gray-100 h-[48px] w-[280px]">
              <div 
                className="absolute inset-y-1 w-[136px] rounded-xl bg-white shadow-md transition-all duration-500 ease-out-expo"
                style={{ transform: `translateX(${tab === "queue" ? "0" : "138px"})` }}
              />
              <button 
                onClick={() => setTab("queue")}
                className={`relative z-10 w-[136px] text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${tab === "queue" ? "text-navy" : "text-gray-400 hover:text-gray-600"}`}
              >
                Approval Queue
              </button>
              <button 
                onClick={() => setTab("catalog")}
                className={`relative z-10 w-[136px] text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${tab === "catalog" ? "text-navy" : "text-gray-400 hover:text-gray-600"}`}
              >
                Seed Catalog
              </button>
           </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search providers, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[1.5rem] border-2 border-gray-100 bg-gray-50/50 py-4 pl-14 pr-6 text-xs font-black uppercase tracking-widest outline-none focus:border-navy focus:bg-white transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => void loadPending()}
          className="flex items-center gap-2 rounded-2xl bg-navy px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:-translate-y-1 transition-all shadow-xl shadow-navy/20"
        >
          <Filter size={16} /> Refresh
        </button>
      </div>

      {tab === "queue" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Queue...</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center">
               <div className="mx-auto h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-6">
                  <CheckCircle2 size={40} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Queue Cleared. Total Zen.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pending.map((b, idx) => (
                <div 
                  key={b.id} 
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo group relative rounded-[3rem] border-2 border-gray-50 bg-white p-10 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-8">
                     <div className="h-14 w-14 rounded-2xl bg-navy/5 flex items-center justify-center text-navy font-black text-xl italic group-hover:bg-navy group-hover:text-white transition-all duration-500">
                        {b.name[0]}
                     </div>
                     <span className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                        <Clock size={12} /> Pending
                     </span>
                  </div>
                  
                  <h4 className="text-2xl font-black text-navy uppercase tracking-tighter italic">{b.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 mb-8">Role: {b.category}</p>
                  
                  <div className="space-y-3 mb-10">
                     <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                        <MapPin size={16} className="text-gray-300" /> {b.locality}, {b.city}
                     </div>
                     <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                        <Users size={16} className="text-gray-300" /> {b.ownerEmail}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                    <button
                      onClick={() => act(b.id, "approve")}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => act(b.id, "reject")}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all font-black"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "catalog" && (
        <div className="rounded-[3rem] bg-white p-8 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Professional</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Location</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Status</th>
                  <th className="px-8 py-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSeed.map((business, idx) => (
                  <tr key={business.slug} className="hover:bg-gray-50/50 transition-all group animate-in fade-in slide-in-from-left-4 duration-500" style={{ transitionDelay: `${idx * 20}ms` }}>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] shadow-xl transition-transform group-hover:rotate-3">
                          <Image
                            src={business.image || "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=200"}
                            alt={business.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-lg font-black text-navy uppercase tracking-tighter italic">{business.name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{business.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 font-black text-navy uppercase italic text-xs tracking-widest">{business.category}</td>
                    <td className="px-8 py-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">{business.locality}</td>
                    <td className="px-8 py-8">
                      {business.verified ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/5 px-4 py-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                           Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/5 px-4 py-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                           Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-8 text-right">
                      <button className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-navy hover:text-white transition-all shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
