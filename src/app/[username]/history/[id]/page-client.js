"use client";

import { useState } from "react";
import { formatWeight, typeBadgeClass } from "@/lib/format-weight";
import {
  formatSessionDate,
  formatSessionTime,
  sessionStatusClass,
  sessionStatusLabel,
} from "@/lib/history-display";
import RoutineItemEditor from "@/components/RoutineItemEditor";

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61a.75.75 0 0 1-.37.199l-3.25.65a.75.75 0 0 1-.877-.877l.65-3.25a.75.75 0 0 1 .199-.37l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L3.5 11.06l-.39 1.95 1.95-.39 8.573-8.573a.25.25 0 0 0 0-.354l-1.086-1.086-.12-.12Z" />
    </svg>
  );
}

export default function HistoryDetailClient({ initialSession, username }) {
  const [session, setSession] = useState(initialSession);
  const [editingIndex, setEditingIndex] = useState(null);

  const endedAt = session.completedAt ?? session.cancelledAt;
  const editingItem = editingIndex !== null ? session.completedItems[editingIndex] : null;

  async function handleSaved(updatedItem) {
    // API call is already done inside RoutineItemEditor — we just sync state
    setSession((prev) => {
      const newItems = [...prev.completedItems];
      newItems[editingIndex] = {
        ...newItems[editingIndex],
        ...updatedItem,
        Exercise: newItems[editingIndex].Exercise, // preserve populated exercise
      };
      return { ...prev, completedItems: newItems };
    });
    setEditingIndex(null);
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-zinc-500">
          <a href={`/${username}/history`} className="hover:underline">Workout History</a>
        </p>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {session.routineName}
        </h1>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sessionStatusClass(session.status)}`}
            >
              {sessionStatusLabel(session.status)}
            </span>
            <span className="text-sm text-zinc-500">
              {formatSessionDate(session.startedAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Started {formatSessionTime(session.startedAt)}
            {endedAt ? ` · Ended ${formatSessionTime(endedAt)}` : ""}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {session.completedItems.length} exercise
            {session.completedItems.length === 1 ? "" : "s"} completed
          </p>
        </div>

        {session.completedItems.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No exercises were logged.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {session.completedItems.map((item, index) => (
              <li
                key={`${item.exerciseId}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {item.Exercise?.Name ?? item.exerciseId}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(item.Type)}`}
                    >
                      {item.Type}
                    </span>
                  </div>

                  {formatWeight(item) && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {formatWeight(item)}
                    </p>
                  )}

                  {item.Sets != null && item.Reps != null && (
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.Sets}×{item.Reps}
                    </p>
                  )}

                  {item.Note && (
                    <p className="mt-1 text-sm text-zinc-500">{item.Note}</p>
                  )}

                  {item.completedAt && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatSessionTime(item.completedAt)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  aria-label={`Edit ${item.Exercise?.Name ?? item.exerciseId}`}
                  className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <PencilIcon />
                </button>
              </li>
            ))}
          </ol>
        )}
      </main>

      <RoutineItemEditor
        item={editingItem}
        itemIndex={editingIndex}
        sessionId={session._id}
        userId={username}
        open={editingIndex !== null}
        onCancel={() => setEditingIndex(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
