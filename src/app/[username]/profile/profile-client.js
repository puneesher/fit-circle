"use client";

import { useState } from "react";
import { kgToLbs, latestWeight, SEX_OPTIONS } from "@/lib/profile";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

function Field({ label, htmlFor, children, hint }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-zinc-500"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfileClient({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [displayName, setDisplayName] = useState(initialUser.displayName ?? "");
  const [avatar, setAvatar] = useState(initialUser.avatar ?? "");
  const [sex, setSex] = useState(initialUser.sex ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialUser.dateOfBirth ? initialUser.dateOfBirth.slice(0, 10) : "",
  );
  const [height, setHeight] = useState(
    initialUser.height != null ? String(initialUser.height) : "",
  );
  const [newWeightKg, setNewWeightKg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

  const weightHistory = Array.isArray(user.weight) ? user.weight : [];
  const current = latestWeight(weightHistory);
  const previewLbs =
    newWeightKg !== "" && Number(newWeightKg) > 0 ? kgToLbs(newWeightKg) : null;

  const sortedHistory = [...weightHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  async function patch(payload, { clearWeight = false } = {}) {
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save changes.");
      }
      const updated = await res.json();
      setUser(updated);
      if (clearWeight) setNewWeightKg("");
      setSavedMessage("Saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    patch({
      displayName: displayName.trim(),
      avatar: avatar.trim(),
      sex: sex || null,
      dateOfBirth: dateOfBirth || null,
      height: height === "" ? null : Number(height),
    });
  }

  function handleAddWeight(e) {
    e.preventDefault();
    const value = Number(newWeightKg);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a weight greater than 0.");
      return;
    }
    patch({ weightKg: value }, { clearWeight: true });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-4xl">{user.avatar}</span>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {user.displayName}
          </h1>
          <p className="text-sm text-zinc-500">@{user.username}</p>
        </div>
      </div>

      {/* Profile details */}
      <form
        onSubmit={handleSaveProfile}
        className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
          Profile
        </h2>
        <div className="space-y-4">
          <Field label="Display Name" htmlFor="displayName">
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Avatar (emoji or image URL)" htmlFor="avatar">
            <input
              id="avatar"
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="e.g. 🏋️ or https://..."
              className={inputClass}
            />
          </Field>

          <Field label="Sex" htmlFor="sex">
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className={inputClass}
            >
              <option value="">Prefer not to say</option>
              {SEX_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date of Birth" htmlFor="dob">
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Height (cm)" htmlFor="height">
            <input
              id="height"
              type="number"
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 175"
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>

      {/* Weight tracking */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 font-medium text-zinc-900 dark:text-zinc-50">
          Weight
        </h2>
        {current ? (
          <p className="mb-4 text-sm text-zinc-500">
            Current: {current.kg} kg ({current.lbs} lbs) · {formatDate(current.date)}
          </p>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">No weight recorded yet.</p>
        )}

        <form onSubmit={handleAddWeight} className="space-y-3">
          <Field
            label="Add weight (kg)"
            htmlFor="weight"
            hint={previewLbs != null ? `= ${previewLbs} lbs` : "Entered in kg, stored with pounds too"}
          >
            <input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={newWeightKg}
              onChange={(e) => setNewWeightKg(e.target.value)}
              placeholder="e.g. 72.5"
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {saving ? "Saving…" : "Record Weight"}
          </button>
        </form>

        {sortedHistory.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              History
            </h3>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sortedHistory.map((entry, i) => (
                <li
                  key={`${entry.date}-${i}`}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-zinc-500">{formatDate(entry.date)}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {entry.kg} kg
                    <span className="ml-2 text-zinc-400">{entry.lbs} lbs</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(error || savedMessage) && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            error ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
          }`}
        >
          {error ?? savedMessage}
        </p>
      )}
    </div>
  );
}
