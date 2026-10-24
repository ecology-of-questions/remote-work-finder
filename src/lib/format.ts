import type { Job, Tristate } from "./types";

const currencySymbol: Record<NonNullable<Job["pay"]>["currency"], string> = {
  USD: "$",
  JPY: "¥",
  EUR: "€",
};

const unitLabel: Record<NonNullable<Job["pay"]>["unit"], string> = {
  hour: "時間",
  task: "タスク",
  month: "月",
};

export function formatPay(pay: Job["pay"]): string {
  if (!pay || (pay.min === null && pay.max === null)) return "報酬未公開";
  const s = currencySymbol[pay.currency];
  const unit = unitLabel[pay.unit];
  if (pay.min !== null && pay.max !== null && pay.min !== pay.max) {
    return `${s}${pay.min}〜${s}${pay.max} / ${unit}`;
  }
  if (pay.max !== null && pay.min === null) return `最大 ${s}${pay.max} / ${unit}`;
  return `${s}${pay.min ?? pay.max} / ${unit}`;
}

export function formatWeeklyHours(h: Job["weeklyHours"]): string {
  if (!h || (h.min === null && h.max === null)) return "週の稼働時間は未公開";
  if (h.min !== null && h.max !== null) return `週${h.min}〜${h.max}時間`;
  if (h.min !== null) return `週${h.min}時間以上`;
  return `週${h.max}時間まで`;
}

/** yes / no はその項目に合わせた言い方 (例: 必要 / 不要) */
export function formatTristate(v: Tristate, yes = "あり", no = "なし"): string {
  if (v === null) return "未確認";
  return v ? yes : no;
}
