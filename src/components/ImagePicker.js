"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ImagePicker({ value, onChange }) {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((imgs) => {
        setImages(imgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = images.filter((src) =>
    src.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        placeholder="Filter images…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
      />

      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">No images match.</p>
      ) : (
        <div className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto rounded-lg border border-zinc-200 p-1.5 dark:border-zinc-700">
          {/* None option */}
          <button
            type="button"
            onClick={() => onChange("")}
            className={`flex aspect-square items-center justify-center rounded-md border text-xs text-zinc-400 transition-colors ${
              !value
                ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
            }`}
          >
            None
          </button>

          {filtered.map((src) => {
            const selected = value === src;
            return (
              <button
                key={src}
                type="button"
                onClick={() => onChange(src)}
                title={src.replace("/images/", "")}
                className={`relative aspect-square overflow-hidden rounded-md border transition-colors ${
                  selected
                    ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                }`}
              >
                <Image
                  src={src}
                  alt={src.replace("/images/", "")}
                  fill
                  className="object-cover"
                  sizes="60px"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}

      {value && (
        <p className="truncate text-xs text-zinc-400">Selected: {value}</p>
      )}
    </div>
  );
}
