"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import { getAdminHeaders } from "@/lib/adminFetch";

type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users", { headers: await getAdminHeaders() });
    const data = (await res.json()) as { users?: AdminUser[]; note?: string; error?: string };
    if (!res.ok) setNote(data.error ?? "Failed");
    else {
      setUsers(data.users ?? []);
      setNote(data.note ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (uid: string, disabled: boolean) => {
    const h = await getAdminHeaders();
    const res = await fetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ disabled }),
    });
    if (res.ok) void load();
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.displayName || "").toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={20} /> Loading users…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-[#1a1f2e]">User management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Firebase Auth users (C7). Impersonation is not enabled — use support procedures in production.
        </p>
        {note && <p className="mt-2 text-xs text-amber-800">{note}</p>}
      </div>

      <div className="max-w-md">
        <input
          type="search"
          placeholder="Search by email, name, or UID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-[#ffca28] focus:outline-none focus:ring-2 focus:ring-[#ffca28]/20"
        />
        <p className="mt-1 text-xs text-gray-400">
          Showing {filtered.length} of {users.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f1f4f9] text-[10px] font-black uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.uid}>
                <td className="px-4 py-3 font-medium">{u.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{u.displayName || "—"}</td>
                <td className="px-4 py-3">
                  {u.disabled ? (
                    <span className="text-xs font-bold text-red-600">Disabled</span>
                  ) : (
                    <span className="text-xs font-bold text-green-700">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void toggle(u.uid, !u.disabled)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-800 hover:bg-gray-50"
                  >
                    {u.disabled ? (
                      <>
                        <ShieldCheck size={14} /> Enable
                      </>
                    ) : (
                      <>
                        <ShieldOff size={14} /> Disable
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !note && <p className="p-6 text-sm text-gray-500">No users returned.</p>}
        {users.length > 0 && filtered.length === 0 && (
          <p className="p-6 text-sm text-gray-500">No users match this search.</p>
        )}
      </div>
    </div>
  );
}
