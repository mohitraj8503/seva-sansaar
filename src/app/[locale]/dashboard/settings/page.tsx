"use client";

import { FormEvent, useEffect, useState } from "react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";

export default function OwnerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationSms, setNotificationSms] = useState(false);
  const [notificationWhatsapp, setNotificationWhatsapp] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        contactEmail: string;
        notificationEmail: boolean;
        notificationSms: boolean;
        notificationWhatsapp: boolean;
      };
      setContactEmail(b.contactEmail);
      setNotificationEmail(b.notificationEmail);
      setNotificationSms(b.notificationSms);
      setNotificationWhatsapp(b.notificationWhatsapp);
      setLoading(false);
    })();
  }, []);

  const onSaveContact = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/owner/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerAuthHeader() },
      body: JSON.stringify({
        contactEmail,
        notificationEmail,
        notificationSms,
        notificationWhatsapp,
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "Preferences saved." : "Could not save.");
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (newPassword.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/owner/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerAuthHeader() },
      body: JSON.stringify({ newPassword }),
    });
    setSaving(false);
    if (res.ok) {
      setNewPassword("");
      setConfirmPassword("");
      setMsg("Password updated.");
    } else setMsg("Could not update password.");
  };

  if (loading) return <p className="text-sm text-gray-600">Loading settings…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Profile & settings</h1>
        <p className="mt-1 text-sm text-gray-600">Contact details and how we notify you.</p>
      </div>

      <form onSubmit={onSaveContact} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Business contact</h2>
        <label className="block text-sm font-semibold text-gray-700">
          Contact email
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Notifications</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={notificationEmail} onChange={(e) => setNotificationEmail(e.target.checked)} />
            Email updates for bookings
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={notificationSms} onChange={(e) => setNotificationSms(e.target.checked)} />
            SMS alerts (when available)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={notificationWhatsapp}
              onChange={(e) => setNotificationWhatsapp(e.target.checked)}
            />
            WhatsApp reminders
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#1a2d5c] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </form>

      <form onSubmit={onChangePassword} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Change password</h2>
        <label className="block text-sm font-semibold text-gray-700">
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-800 disabled:opacity-60"
        >
          Update password
        </button>
      </form>

      {msg && <p className="text-sm font-semibold text-emerald-800">{msg}</p>}
    </div>
  );
}
