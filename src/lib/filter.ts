import type { Job, Tristate } from "./types";

/** 「なし」をどこまで厳密に見るか。confirmed = 確認済みの「なし」だけ / allow-unknown = 未確認も含める */
export type NoneFilter = "any" | "confirmed" | "allow-unknown";

export type SortKey = "added" | "pay" | "checked";

export interface Filters {
  q: string;
  /** 週に働ける時間。null = 指定なし */
  weeklyHours: number | null;
  phone: NoneFilter;
  meetings: NoneFilter;
  shortDayOk: boolean;
  flexibleSchedule: boolean;
  excludeSpeaking: boolean;
  noEnglish: boolean;
  japanOk: boolean;
  category: string;
  kind: "" | Job["kind"];
  savedOnly: boolean;
}

export const emptyFilters: Filters = {
  q: "",
  weeklyHours: null,
  phone: "any",
  meetings: "any",
  shortDayOk: false,
  flexibleSchedule: false,
  excludeSpeaking: false,
  noEnglish: false,
  japanOk: false,
  category: "",
  kind: "",
  savedOnly: false,
};

function matchesNone(value: Tristate, mode: NoneFilter): boolean {
  if (mode === "any") return true;
  if (mode === "confirmed") return value === false;
  return value !== true;
}

export function matchesJob(job: Job, f: Filters, saved: ReadonlySet<string>): boolean {
  if (f.q) {
    const haystack = [job.company, job.title, job.summary, job.category, ...job.requirements]
      .join(" ")
      .toLowerCase();
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.every((w) => haystack.includes(w))) return false;
  }
  // 最低稼働時間が分からない求人は残す (「未公開」で除外すると候補が減りすぎるため)
  const minHours = job.weeklyHours?.min ?? null;
  if (f.weeklyHours !== null && minHours !== null && minHours > f.weeklyHours) return false;
  if (!matchesNone(job.phone, f.phone)) return false;
  if (!matchesNone(job.meetings, f.meetings)) return false;
  if (f.shortDayOk && job.shortDayOk !== true) return false;
  if (f.flexibleSchedule && job.flexibleSchedule !== true) return false;
  if (f.excludeSpeaking && job.speaking === true) return false;
  if (f.noEnglish && job.english !== false) return false;
  if (f.japanOk && job.japanOk !== true) return false;
  if (f.category && job.category !== f.category) return false;
  if (f.kind && job.kind !== f.kind) return false;
  if (f.savedOnly && !saved.has(`job:${job.id}`) && !saved.has(`company:${job.company}`)) return false;
  return true;
}

/** 通貨・単位が違うものは比べられないので、時給 (USD) 以外は並べ替えで後ろに回す */
function hourlyUsd(job: Job): number {
  if (!job.pay || job.pay.unit !== "hour" || job.pay.currency !== "USD") return -1;
  return job.pay.max ?? job.pay.min ?? -1;
}

export function compareJobs(a: Job, b: Job, sort: SortKey): number {
  if (sort === "pay") return hourlyUsd(b) - hourlyUsd(a);
  if (sort === "checked") return b.checkedAt.localeCompare(a.checkedAt);
  return b.addedAt.localeCompare(a.addedAt);
}
