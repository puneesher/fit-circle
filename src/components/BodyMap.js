"use client";

/**
 * Simplified front and back body silhouettes with clickable muscle zones.
 * Each zone has a `data-zone` attribute matching a zone ID.
 * Zone IDs: chest, shoulders, biceps, triceps, forearms, abs, obliques,
 *           quads, adductors, calves-front (front view)
 *           traps, upper-back, lats, lower-back, glutes, hamstrings, calves-back (back view)
 */

const FRONT_ZONES = [
  // Shoulders (left + right)
  { id: "shoulders", d: "M28,52 C28,46 34,42 40,42 L44,42 L44,56 C38,56 28,56 28,52 Z" },
  { id: "shoulders", d: "M76,52 C76,46 70,42 64,42 L60,42 L60,56 C66,56 76,56 76,52 Z" },
  // Chest (left + right)
  { id: "chest", d: "M44,56 L60,56 L60,74 C56,76 48,76 44,74 Z" },
  // Biceps
  { id: "biceps", d: "M28,56 L36,56 L36,76 L28,76 Z" },
  { id: "biceps", d: "M68,56 L76,56 L76,76 L68,76 Z" },
  // Triceps
  { id: "triceps", d: "M36,56 L44,56 L44,76 L36,76 Z" },
  { id: "triceps", d: "M60,56 L68,56 L68,76 L60,76 Z" },
  // Forearms
  { id: "forearms", d: "M26,76 L36,76 L34,98 L24,98 Z" },
  { id: "forearms", d: "M68,76 L78,76 L80,98 L70,98 Z" },
  // Abs
  { id: "abs", d: "M44,74 L60,74 L60,100 L44,100 Z" },
  // Obliques
  { id: "obliques", d: "M38,74 L44,74 L44,100 L38,100 Z" },
  { id: "obliques", d: "M60,74 L66,74 L66,100 L60,100 Z" },
  // Quads
  { id: "quads", d: "M38,100 L52,100 L50,140 L36,140 Z" },
  { id: "quads", d: "M52,100 L66,100 L68,140 L54,140 Z" },
  // Adductors
  { id: "adductors", d: "M48,100 L56,100 L54,130 L50,130 Z" },
  // Calves (front)
  { id: "calves", d: "M36,140 L48,140 L46,170 L34,170 Z" },
  { id: "calves", d: "M56,140 L68,140 L70,170 L58,170 Z" },
];

const BACK_ZONES = [
  // Traps
  { id: "traps", d: "M40,42 L64,42 L60,52 L44,52 Z" },
  // Upper back
  { id: "upper-back", d: "M44,52 L60,52 L60,68 L44,68 Z" },
  // Lats
  { id: "lats", d: "M38,68 L44,68 L44,90 L36,90 Z" },
  { id: "lats", d: "M60,68 L66,68 L68,90 L60,90 Z" },
  // Lower back
  { id: "lower-back", d: "M44,82 L60,82 L60,100 L44,100 Z" },
  // Shoulders (back)
  { id: "shoulders", d: "M28,48 L40,48 L40,58 C34,58 28,56 28,52 Z" },
  { id: "shoulders", d: "M64,48 L76,48 C76,52 70,58 64,58 L64,48 Z" },
  // Triceps (back)
  { id: "triceps", d: "M28,58 L38,58 L36,78 L26,78 Z" },
  { id: "triceps", d: "M66,58 L76,58 L78,78 L68,78 Z" },
  // Glutes
  { id: "glutes", d: "M38,100 L66,100 L66,118 L38,118 Z" },
  // Hamstrings
  { id: "hamstrings", d: "M38,118 L52,118 L50,148 L36,148 Z" },
  { id: "hamstrings", d: "M52,118 L66,118 L68,148 L54,148 Z" },
  // Calves (back)
  { id: "calves", d: "M36,148 L48,148 L46,174 L34,174 Z" },
  { id: "calves", d: "M56,148 L68,148 L70,174 L58,174 Z" },
];

// Head + neck outline (non-interactive)
const HEAD_PATH = "M46,8 C46,4 48,2 52,2 C56,2 58,4 58,8 L58,16 C58,22 56,26 52,28 C48,26 46,22 46,16 Z";
const NECK_PATH = "M48,28 L56,28 L56,42 L48,42 Z";
// Body outline
const BODY_OUTLINE = "M40,42 C30,42 26,48 26,54 L24,98 L34,98 L34,100 L36,140 L34,170 L46,174 L50,140 L54,140 L58,174 L70,170 L68,140 L70,100 L70,98 L80,98 L78,54 C78,48 74,42 64,42 Z";

function BodySilhouette({ zones, zoneColors, onZoneClick, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <svg
        viewBox="0 0 104 180"
        className="h-56 w-auto"
        aria-label={`Body ${label}`}
      >
        {/* Body outline */}
        <path
          d={BODY_OUTLINE}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-300 dark:text-zinc-600"
        />
        {/* Head */}
        <path
          d={HEAD_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-300 dark:text-zinc-600"
        />
        <path
          d={NECK_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-200 dark:text-zinc-700"
        />

        {/* Muscle zones */}
        {zones.map((zone, i) => {
          const color = zoneColors[zone.id];
          return (
            <path
              key={`${zone.id}-${i}`}
              d={zone.d}
              data-zone={zone.id}
              fill={color || "transparent"}
              fillOpacity={color ? 0.6 : 0}
              stroke={color || "currentColor"}
              strokeWidth={color ? "0.5" : "0.3"}
              strokeOpacity={color ? 0.8 : 0.3}
              className={`cursor-pointer transition-all hover:fill-opacity-80 ${!color ? "text-zinc-300 dark:text-zinc-600" : ""}`}
              onClick={() => onZoneClick?.(zone.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Props:
 *   zoneColors — { zoneId: "#hexcolor" } mapping
 *   onZoneClick — (zoneId) => void
 */
export default function BodyMap({ zoneColors = {}, onZoneClick }) {
  return (
    <div className="flex justify-center gap-6">
      <BodySilhouette
        zones={FRONT_ZONES}
        zoneColors={zoneColors}
        onZoneClick={onZoneClick}
        label="Front"
      />
      <BodySilhouette
        zones={BACK_ZONES}
        zoneColors={zoneColors}
        onZoneClick={onZoneClick}
        label="Back"
      />
    </div>
  );
}

// Export zone lists for mapping
export const ALL_ZONES = [
  "shoulders", "chest", "biceps", "triceps", "forearms",
  "abs", "obliques", "quads", "adductors", "calves",
  "traps", "upper-back", "lats", "lower-back", "glutes", "hamstrings",
];
