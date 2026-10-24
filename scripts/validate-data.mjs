// data/*.json がサイトに出してよい形になっているかを build 前に確かめる。
// 形は src/lib/types.ts、記入ルールは CLAUDE.md を参照。
import { readFileSync } from "node:fs";

const jobs = JSON.parse(readFileSync(new URL("../data/jobs.json", import.meta.url), "utf8"));
const experiences = JSON.parse(
  readFileSync(new URL("../data/experiences.json", import.meta.url), "utf8"),
);
const companyList = JSON.parse(readFileSync(new URL("../data/companies.json", import.meta.url), "utf8"));

const errors = [];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isUrl = (v) => typeof v === "string" && /^https:\/\/\S+$/.test(v);
const isStr = (v) => typeof v === "string" && v.trim() !== "";
const isTristate = (v) => v === true || v === false || v === null;
const isNumOrNull = (v) => v === null || (typeof v === "number" && v >= 0);

function check(where, cond, message) {
  if (!cond) errors.push(`${where}: ${message}`);
}

const jobIds = new Set();
for (const [i, j] of jobs.entries()) {
  const at = `jobs[${i}] ${j.id ?? ""}`;
  check(at, ID.test(j.id ?? ""), "id は英小文字・数字・ハイフンで");
  check(at, !jobIds.has(j.id), "id が重複");
  jobIds.add(j.id);
  for (const key of ["company", "title", "summary", "category"]) {
    check(at, isStr(j[key]), `${key} が空`);
  }
  check(at, j.kind === "job" || j.kind === "pool", "kind は job か pool");
  if (j.pay !== null) {
    check(at, typeof j.pay === "object", "pay はオブジェクトか null");
    check(at, isNumOrNull(j.pay?.min) && isNumOrNull(j.pay?.max), "pay.min / pay.max は数値か null");
    check(at, ["USD", "JPY", "EUR"].includes(j.pay?.currency), "pay.currency は USD / JPY / EUR");
    check(at, ["hour", "task", "month"].includes(j.pay?.unit), "pay.unit は hour / task / month");
  }
  if (j.weeklyHours !== null) {
    check(
      at,
      isNumOrNull(j.weeklyHours?.min) && isNumOrNull(j.weeklyHours?.max),
      "weeklyHours.min / max は数値か null",
    );
  }
  check(at, j.employmentType === null || isStr(j.employmentType), "employmentType は文字列か null");
  for (const key of ["phone", "meetings", "speaking", "english", "japanOk", "shortDayOk", "flexibleSchedule"]) {
    check(at, isTristate(j[key]), `${key} は true / false / null (未確認)`);
  }
  check(at, j.englishNote === null || isStr(j.englishNote), "englishNote は文字列か null");
  check(at, Array.isArray(j.requirements) && j.requirements.every(isStr), "requirements は文字列の配列");
  check(at, isUrl(j.applyUrl), "applyUrl は https の URL");
  check(at, isUrl(j.sourceUrl), "sourceUrl (出典) は https の URL。出典のない求人は載せない");
  check(at, DATE.test(j.checkedAt ?? ""), "checkedAt は YYYY-MM-DD");
  check(at, DATE.test(j.addedAt ?? ""), "addedAt は YYYY-MM-DD");
}

const slugs = new Set();
const companyNames = new Set();
for (const [i, c] of companyList.entries()) {
  const at = `companies[${i}] ${c.name ?? ""}`;
  check(at, ID.test(c.slug ?? ""), "slug は英小文字・数字・ハイフンで");
  check(at, !slugs.has(c.slug), "slug が重複");
  check(at, isStr(c.name) && !companyNames.has(c.name), "name が空か重複");
  slugs.add(c.slug);
  companyNames.add(c.name);
  check(at, isStr(c.about), "about が空");
  check(at, isUrl(c.website), "website は https の URL");
  for (const key of ["payment", "payout", "hiring"]) {
    check(at, c[key] === null || isStr(c[key]), `${key} は文字列か null (未確認)`);
  }
  check(at, Array.isArray(c.notes) && c.notes.every(isStr), "notes は文字列の配列");
  check(
    at,
    Array.isArray(c.sourceUrls) && c.sourceUrls.length > 0 && c.sourceUrls.every(isUrl),
    "sourceUrls (出典) は https の URL を1つ以上",
  );
  check(at, DATE.test(c.checkedAt ?? ""), "checkedAt は YYYY-MM-DD");
}
for (const [i, j] of jobs.entries()) {
  check(`jobs[${i}] ${j.id ?? ""}`, companyNames.has(j.company), `company "${j.company}" が companies.json にない`);
}

const companies = new Set(jobs.map((j) => j.company));
const expIds = new Set();
for (const [i, e] of experiences.entries()) {
  const at = `experiences[${i}] ${e.id ?? ""}`;
  check(at, ID.test(e.id ?? ""), "id は英小文字・数字・ハイフンで");
  check(at, !expIds.has(e.id), "id が重複");
  expIds.add(e.id);
  check(at, companies.has(e.company), `company "${e.company}" が jobs.json にない (表記を揃える)`);
  check(at, ["work", "hiring", "payment"].includes(e.topic), "topic は work / hiring / payment");
  check(at, isStr(e.summary), "summary が空");
  check(at, isUrl(e.sourceUrl), "sourceUrl (元の投稿) は https の URL");
  check(at, isStr(e.platform) && isStr(e.author), "platform と author は必須");
  check(at, e.postedAt === null || DATE.test(e.postedAt), "postedAt は YYYY-MM-DD か null");
  check(at, ["unverified", "verified", "rejected"].includes(e.status), "status は unverified / verified / rejected");
  if (e.status === "verified") {
    check(at, DATE.test(e.verifiedAt ?? ""), "verified なら verifiedAt (YYYY-MM-DD) が必要");
  }
}

if (errors.length > 0) {
  console.error(`data の検証で ${errors.length} 件の問題:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const verified = experiences.filter((e) => e.status === "verified").length;
console.log(`data OK: 会社 ${companyList.length} 社 / 求人 ${jobs.length} 件 / 体験談 ${experiences.length} 件 (公開 ${verified} 件)`);
