"use client";

import { useState, useEffect } from "react";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function UsersClient({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sync form fields when editing user changes
  useEffect(() => {
    if (editingId) {
      const user = users.find((u) => u._id === editingId);
      if (user) {
        setDisplayName(user.displayName);
        setAvatar(user.avatar);
        setError(null);
      }
    }
  }, [editingId, users]);

  function handleEdit(userId) {
    setEditingId(userId);
  }

  function handleCancel() {
    setEditingId(null);
    setError(null);
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setError(null);

    const trimmedName = displayName.trim();
    const trimmedAvatar = avatar.trim();

    if (!trimmedName) {
      setError("Display name is required.");
      return;
    }
    if (!trimmedAvatar) {
      setError("Avatar is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmedName, avatar: trimmedAvatar }),
      });

      if (!res.ok) throw new Error("Failed to update user.");

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Users
      </h1>

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user._id}>
            <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-3xl">{user.avatar}</span>
              <span className="flex-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={() => handleEdit(user._id)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
            </div>

            {/* Inline edit dialog */}
            {editingId === user._id && (
              <form
                onSubmit={handleConfirm}
                className="mt-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  <Field label="Display Name" htmlFor={`edit-name-${user._id}`}>
                    <input
                      id={`edit-name-${user._id}`}
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </Field>

                  <Field label="Avatar (emoji or image URL)" htmlFor={`edit-avatar-${user._id}`}>
                    <input
                      id={`edit-avatar-${user._id}`}
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="e.g. 🏋️ or https://..."
                      className={inputClass}
                    />
                  </Field>

                  {error && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
