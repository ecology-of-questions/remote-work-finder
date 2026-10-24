// data/*.json を型付きで読み、ページ間で同じ見方をそろえる
import jobsData from "../../data/jobs.json";
import companiesData from "../../data/companies.json";
import experiencesData from "../../data/experiences.json";
import type { Company, Experience, Job } from "./types";

export const jobs = jobsData as Job[];
export const companies = companiesData as Company[];
// 公開するのは人が原文を確認した体験談だけ
export const experiences = (experiencesData as Experience[]).filter((e) => e.status === "verified");

/** jobs.json に出てくる順 (= 掲載順) の会社 */
export const listedCompanies: Company[] = [...new Set(jobs.map((j) => j.company))].map(companyByName);

export function companyByName(name: string): Company {
  const company = companies.find((c) => c.name === name);
  // scripts/validate-data.mjs で build 前に弾いているので、ここに来るのはデータの不整合だけ
  if (!company) throw new Error(`companies.json に "${name}" がない`);
  return company;
}

export function companyPath(company: Company): string {
  return `/companies/${company.slug}/`;
}

export function jobsOf(company: Company): Job[] {
  return jobs.filter((j) => j.company === company.name);
}

export function experiencesOf(company: Company): Experience[] {
  return experiences.filter((e) => e.company === company.name);
}
