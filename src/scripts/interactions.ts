// どのページでも使う操作: 保存ボタン、詳細ダイアログ、体験談のタブ
import { SAVED_CHANGE, saved, toggleSaved } from "../lib/saved";

function syncSaveButtons() {
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-save]")) {
    b.setAttribute("aria-pressed", String(saved.has(b.dataset.save!)));
  }
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  const saveBtn = target.closest<HTMLButtonElement>("[data-save]");
  if (saveBtn) {
    toggleSaved(saveBtn.dataset.save!);
    return;
  }

  const openBtn = target.closest<HTMLElement>("[data-open-dialog]");
  if (openBtn) {
    document.querySelector<HTMLDialogElement>(`[data-dialog="${openBtn.dataset.openDialog}"]`)?.showModal();
    return;
  }

  if (target.closest("[data-close-dialog]")) {
    target.closest("dialog")?.close();
    return;
  }

  // 背景 (dialog 自身) をクリックしたら閉じる
  if (target instanceof HTMLDialogElement) target.close();
});

document.addEventListener("change", (event) => {
  const tab = event.target as HTMLInputElement;
  if (!tab.matches("[data-topic-tab]")) return;
  const section = tab.closest("[data-experiences]")!;
  for (const li of section.querySelectorAll<HTMLElement>("[data-topic]")) {
    li.hidden = tab.value !== "" && li.dataset.topic !== tab.value;
  }
});

document.addEventListener(SAVED_CHANGE, syncSaveButtons);
syncSaveButtons();
