# remote-work-finder

フルリモートの仕事だけを集めた一覧サイト。電話・会議の有無、週の稼働時間、
1日2時間まで働けるか、などで絞り込める。

## 使い方

Claude Code でこのリポジトリのセッションを開き、たとえば次のように頼む。

- 「フルリモートで英語不要の翻訳の求人を5件追加して」
- 「checkedAt が古い求人を5件点検して」
- 「Grok の回答を貼るので体験談に追加して」（このあと回答を貼る）

Claude が調べて `data/*.json` を更新し、内容を見せる。確認して OK を出すと push され、
Cloudflare が自動で公開する。手順の細かいルールは `CLAUDE.md` にある。

## 開発

```sh
npm install
npm run dev       # http://localhost:4321
npm run validate  # data/*.json の検証
npm run build     # 検証 + 静的ビルド (dist/)
```
