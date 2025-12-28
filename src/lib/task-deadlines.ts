// src/lib/task-deadlines.ts
export type HHMM = `${number}${number}:${number}${number}`;

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatHHMM(d: Date): HHMM {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}` as HHMM;
}

export function parseHHMM(hhmm: string): { hours: number; minutes: number } | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;

  const hours = Number(m[1]);
  const minutes = Number(m[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}

/**
 * Build a "next occurrence" deadline:
 * - If template time is later today -> today at that time
 * - If template time already passed -> tomorrow at that time
 */
export function buildNextDeadlineFromTime(
  time: string,
  now: Date = new Date()
): Date | null {
  const parsed = parseHHMM(time);
  if (!parsed) return null;

  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
}
