# remote-work-finder

フルリモート（在宅で完結する）仕事だけを集めた一覧サイト。
求人と体験談は `data/*.json` に置き、Astro が静的サイトとして書き出す。
API は使わない。データの追加は、Claude Code のセッションで人が頼み、
Claude が調べて JSON を書き、人が確認してから push する。

## 構成

- Astro（`output: "static"`）/ TypeScript strict / ライブラリなし
- `data/jobs.json` … 求人。形は `src/lib/types.ts` の `Job`
- `data/experiences.json` … 体験談。形は `Experience`
- `scripts/validate-data.mjs` … build 前に必ず走るデータ検証。通らないと build が失敗する
- `src/lib/filter.ts` … 絞り込み・並べ替え（ブラウザで動く）
- `src/styles/tokens.css` … 色・文字・余白の値はここだけ。コンポーネントに直接書かない
- 保存（＋保存）はブラウザの localStorage のみ。サーバーに個人情報を送らない
- 公開は Cloudflare Workers Builds（`wrangler.jsonc`、静的アセットのみ）

## 求人を追加するとき（「求人を追加して」と頼まれたら）

1. Web で探し、**求人ページ本体を開いて**条件を読む。検索結果の抜粋やまとめ記事だけで書かない
2. フルリモートでないもの（出社・ハイブリッド・地域限定の在宅）は入れない
3. `data/jobs.json` の末尾に追記する。記入ルール:
   - `sourceUrl` は読んだ求人ページ、`checkedAt` は読んだ日、`addedAt` は追加した日
   - 求人ページに書いていないことは推測しない。真偽値は `null`（=未確認）、
     数値は `null`、`employmentType` は `null`
   - `pay.max` だけ書いてあるなら `min: null`。上限額であることなどは `pay.note` に
   - `kind`: 具体的な募集は `job`、将来案件のための人材登録は `pool`
   - `company` は同じ会社なら既存の表記に揃える（グループ化と体験談の紐づけに使う）
   - `summary` は日本語1〜2文。誇張しない
   - `id` は `会社-職種` の英小文字ハイフン区切り。既存と重複させない
4. すでにある求人と同じものは追加せず、条件が変わっていれば更新して `checkedAt` を直す
5. `npm run validate` を通す
6. 追加・更新した求人を表で見せ、「出典で確認できなかった項目（null にしたもの）」を明記する
7. 人の OK が出てから commit・push する（OK の前に push しない）

古い求人の点検を頼まれたら、`checkedAt` が古い順に出典を開き直し、
募集が終わっていれば削除、条件が変わっていれば更新する。

## 体験談を追加するとき（Grok などの回答を貼られたら）

AI が出した「体験談」は実在しないことがある。原文を人が確かめるまで公開しない。

1. 貼られた内容から、元投稿の URL があるものだけを取り出す。URL のないものは捨てる
2. `data/experiences.json` に `status: "unverified"`、`verifiedAt: null` で追加する
   - `summary` は日本語の短い要約。原文を丸写ししない
   - `author` は投稿者の識別子（X ならハンドル）。同じ人の複数投稿を別人と数えないために使う
   - `company` は `jobs.json` の表記に揃える。該当する会社がなければ追加しない
   - `topic`: 案件・作業 = `work` / 登録・選考 = `hiring` / 報酬・入金 = `payment`
3. 追加した体験談を URL 付きの一覧で見せ、人に原文の確認を頼む
4. 人が「確認した」と言ったものだけ `status: "verified"`、`verifiedAt` を今日にする。
   原文と合わない・存在しないと言われたものは `rejected`
5. Claude が自分で「verified」にしない。サイトに出るのは `verified` だけ

## コミット

形式: `type(scope): 日本語で役割を書く`（type は feat / fix / refactor / style / docs / chore / data）。
データの更新は `data(jobs): 〇〇の求人を3件追加` のように書く。
