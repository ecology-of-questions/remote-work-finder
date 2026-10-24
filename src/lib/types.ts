// data/*.json の形。項目の意味と記入ルールは CLAUDE.md の「データの書き方」を参照。
// 真偽値の項目は null = 「未確認」。分からないことを推測で埋めない。

export type Tristate = boolean | null;

export interface Job {
  /** 英小文字とハイフン。会社-職種 (例: superannotate-senior-video-editor) */
  id: string;
  company: string;
  title: string;
  /** 一覧に出す1〜2文の説明 */
  summary: string;
  /** job = 個別求人 / pool = 登録先 (将来の案件のための人材登録) */
  kind: "job" | "pool";
  /** 職種カテゴリ (例: AI評価, 翻訳, 動画編集) */
  category: string;
  pay: {
    min: number | null;
    max: number | null;
    currency: "USD" | "JPY" | "EUR";
    unit: "hour" | "task" | "month";
    note: string | null;
  } | null;
  /** 週の稼働時間。null = 未公開 */
  weeklyHours: { min: number | null; max: number | null } | null;
  /** 業務委託 / 正社員 / 契約社員 など。null = 未確認 */
  employmentType: string | null;
  phone: Tristate;
  meetings: Tristate;
  /** 録音・発話を伴う作業があるか */
  speaking: Tristate;
  english: Tristate;
  englishNote: string | null;
  /** 日本在住者が応募できるか */
  japanOk: Tristate;
  /** 1日2時間までで働けるか */
  shortDayOk: Tristate;
  /** 働く時間を自分で決められるか */
  flexibleSchedule: Tristate;
  /** 応募条件・選考テスト */
  requirements: string[];
  applyUrl: string;
  /** 情報の出典 (求人ページなど)。必須 */
  sourceUrl: string;
  /** 出典を最後に確認した日 (YYYY-MM-DD) */
  checkedAt: string;
  /** サイトに追加した日 (YYYY-MM-DD)。掲載順に使う */
  addedAt: string;
}

/** 会社の基本情報。null の項目は「未確認」と表示する */
export interface Company {
  /** 会社ページの URL (/companies/<slug>)。英小文字とハイフン */
  slug: string;
  /** Job.company と同じ表記 */
  name: string;
  /** 1〜2文の説明 */
  about: string;
  website: string;
  /** 支払い方法 (例: PayPal) */
  payment: string | null;
  /** 支払いの頻度 (例: 毎週) */
  payout: string | null;
  /** 応募から仕事を始めるまでの流れ */
  hiring: string | null;
  /** そのほか応募前に知っておくとよいこと */
  notes: string[];
  /** 上の情報の出典 */
  sourceUrls: string[];
  checkedAt: string;
}

export type ExperienceTopic = "work" | "hiring" | "payment";

export interface Experience {
  id: string;
  /** Job.company と同じ表記にする */
  company: string;
  /** work = 案件・作業 / hiring = 登録・選考 / payment = 報酬・入金 */
  topic: ExperienceTopic;
  /** 投稿内容の要約 (日本語)。原文の丸写しはしない */
  summary: string;
  sourceUrl: string;
  /** X, Reddit など */
  platform: string;
  /** 同じ投稿者を別人として数えないための識別子 (例: X のハンドル) */
  author: string;
  postedAt: string | null;
  /** unverified = Grok などから来たまま / verified = 人が原文を確認済み / rejected = 原文と合わない・存在しない */
  status: "unverified" | "verified" | "rejected";
  verifiedAt: string | null;
}
