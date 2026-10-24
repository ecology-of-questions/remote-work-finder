// 保存した求人・会社。ブラウザの localStorage にだけ置く。
// キーは "job:<id>" か "company:<会社名>"。

const STORAGE_KEY = "remote-work-finder:saved";
export const SAVED_CHANGE = "saved-change";

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export const saved: ReadonlySet<string> = load();

export function toggleSaved(key: string): void {
  const set = saved as Set<string>;
  if (set.has(key)) set.delete(key);
  else set.add(key);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // 保存できない環境 (プライベートモードなど) ではこのページを開いている間だけ覚える
  }
  document.dispatchEvent(new CustomEvent(SAVED_CHANGE));
}
