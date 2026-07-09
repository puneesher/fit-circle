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
  const [creating, setCreating] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
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

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    if (!newUsername.trim() || !newDisplayName.trim() || !newAvatar.trim()) {
      setError("All fields are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          displayName: newDisplayName.trim(),
          avatar: newAvatar.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create user.");
      }

      const created = await res.json();
      setUsers((prev) => [...prev, created]);
      setCreating(false);
      setNewUsername("");
      setNewDisplayName("");
      setNewAvatar("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Users
        </h1>
        <button
          type="button"
          onClick={() => { setCreating(true); setError(null); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          aria-label="Create new user"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="10" y1="4" x2="10" y2="16" />
            <line x1="4" y1="10" x2="16" y2="10" />
          </svg>
        </button>
      </div>

      {/* Create user form */}
      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">New User</h2>
          <div className="space-y-4">
            <Field label="Username (slug)" htmlFor="new-username">
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. jd"
                className={inputClass}
                required
              />
            </Field>
            <Field label="Display Name" htmlFor="new-displayname">
              <input
                id="new-displayname"
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                className={inputClass}
                required
              />
            </Field>
            <Field label="Avatar (emoji or image URL)" htmlFor="new-avatar">
              <input
                id="new-avatar"
                type="text"
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                placeholder="e.g. 💪"
                className={inputClass}
                required
              />
            </Field>
            {error && !editingId && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => { setCreating(false); setError(null); }}
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
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

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
