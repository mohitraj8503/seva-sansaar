"use client";

import { FormEvent, useEffect, useState } from "react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";
import type { BusinessAvailability } from "@/lib/types";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function OwnerCalendarPage() {
  const [av, setAv] = useState<BusinessAvailability | null>(null);
  const [blockedDate, setBlockedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const s = readOwnerSession();
    if (!s) return;
    void (async () => {
      const res = await fetch("/api/owner/availability", { headers: { ...ownerAuthHeader() } });
      if (res.ok) {
        const data = (await res.json()) as { availability: BusinessAvailability };
        setAv(data.availability);
      }
      setLoading(false);
    })();
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!av) return;
    setMsg("");
    const res = await fetch("/api/owner/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerAuthHeader() },
      body: JSON.stringify(av),
    });
    setMsg(res.ok ? "Saved." : "Could not save.");
  };

  const addBlocked = () => {
    if (!blockedDate || !av) return;
    if (av.blockedDates.includes(blockedDate)) return;
    setAv({ ...av, blockedDates: [...av.blockedDates, blockedDate] });
    setBlockedDate("");
  };

  if (loading || !av) return <p className="text-sm text-gray-600">Loading calendar…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Availability</h1>
        <p className="mt-1 text-sm text-gray-600">Default weekly hours, blocked dates, and exceptions (C4).</p>
      </div>

      <form onSubmit={save} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6">
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Weekly hours</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {days.map((d) => {
              const row = av.weekly[d];
              return (
                <div key={d} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 p-3">
                  <span className="w-12 text-xs font-bold uppercase text-gray-600">{d}</span>
                  {row ? (
                    <>
                      <input
                        type="time"
                        value={row.open}
                        onChange={(e) =>
                          setAv({
                            ...av,
                            weekly: { ...av.weekly, [d]: { ...row!, open: e.target.value } },
                          })
                        }
                        className="rounded border px-2 py-1 text-xs"
                      />
                      <span className="text-xs">–</span>
                      <input
                        type="time"
                        value={row.close}
                        onChange={(e) =>
                          setAv({
                            ...av,
                            weekly: { ...av.weekly, [d]: { ...row!, close: e.target.value } },
                          })
                        }
                        className="rounded border px-2 py-1 text-xs"
                      />
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Blocked dates</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="date"
              value={blockedDate}
              onChange={(e) => setBlockedDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button type="button" onClick={addBlocked} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold">
              Block
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {av.blockedDates.map((d) => (
              <li key={d} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                {d}
                <button
                  type="button"
                  className="ml-2 text-red-600"
                  onClick={() => setAv({ ...av, blockedDates: av.blockedDates.filter((x) => x !== d) })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <button type="submit" className="rounded-lg bg-[#1a2d5c] px-6 py-3 text-sm font-bold text-white">
          Save availability
        </button>
        {msg && <p className="text-sm font-semibold text-emerald-800">{msg}</p>}
      </form>
    </div>
  );
}
