"use client";

import { FormEvent, useEffect, useState } from "react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import { ServiceAreaPicker } from "@/components/business/ServiceAreaPicker";

export default function MyListingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState("");
  const [pricing, setPricing] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrls, setPhotoUrls] = useState("");
  const [areas, setAreas] = useState<ServiceAreaPlace[]>([]);

  useEffect(() => {
    const s = readOwnerSession();
    if (!s) return;
    void (async () => {
      const res = await fetch("/api/owner/business", { headers: { ...ownerAuthHeader() } });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const b = (await res.json()) as {
        name: string;
        category: string;
        services: string[];
        phone: string;
        whatsapp: string;
        address: string;
        locality: string;
        city: string;
        hours: string;
        pricing: string;
        description: string;
        photoUrls: string[];
        serviceAreas: ServiceAreaPlace[];
      };
      setName(b.name);
      setCategory(b.category);
      setServices(b.services.join(", "));
      setPhone(b.phone);
      setWhatsapp(b.whatsapp);
      setAddress(b.address);
      setLocality(b.locality);
      setCity(b.city);
      setHours(b.hours);
      setPricing(b.pricing);
      setDescription(b.description);
      setPhotoUrls(b.photoUrls.join("\n"));
      setAreas(b.serviceAreas ?? []);
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const servicesArr = services
      .split(/[,|]/)
      .map((x) => x.trim())
      .filter(Boolean);
    const photos = photoUrls
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const res = await fetch("/api/owner/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerAuthHeader() },
      body: JSON.stringify({
        name,
        category,
        services: servicesArr,
        phone,
        whatsapp,
        address,
        locality,
        city,
        hours,
        pricing,
        description,
        photoUrls: photos,
        serviceAreas: areas,
      }),
    });
    setSaving(false);
    if (!res.ok) setMessage("Could not save changes.");
    else setMessage("Saved successfully.");
  };

  if (loading) {
    return <p className="text-sm text-gray-600">Loading your listing…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My listing</h1>
        <p className="mt-1 text-sm text-gray-600">Update how customers see your business on Seva Sansaar.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Business name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Category
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700 md:col-span-2">
            Services (comma-separated)
            <input
              required
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            WhatsApp number
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700 md:col-span-2">
            Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Locality
            <input value={locality} onChange={(e) => setLocality(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Hours
            <input value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Pricing
            <input value={pricing} onChange={(e) => setPricing(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-gray-700 md:col-span-2">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-2">
            <ServiceAreaPicker value={areas} onChange={setAreas} />
          </div>
          <label className="text-sm font-semibold text-gray-700 md:col-span-2">
            Photo URLs (one per line)
            <textarea
              value={photoUrls}
              onChange={(e) => setPhotoUrls(e.target.value)}
              placeholder="https://…"
              className="mt-1 h-24 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#1a2d5c] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
      </form>
    </div>
  );
}
