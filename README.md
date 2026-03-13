# Video Store Front Mock

## 画面
- `product.html` 商品ページ
- `product-detail.html` 商品詳細ページ
- `purchase-confirm.html` 購入確認ページ
- `thankyou.html` サンクスページ
- `login.html` ログインページ
- `register.html` 会員登録ページ
- `mypage.html` 購入済み動画一覧ページ
- `watch.html` 動画視聴ページ
- `tokusho.html` 特定商取引法に基づく表記
- `terms.html` 利用規約
- `privacy.html` プライバシーポリシー

## 起動
- `index.html` を開く（`product.html` へ遷移）

## 状態分岐（モック）
- `localStorage` キー: `videoStoreMockState`
- `loggedIn: false` => 未ログイン
- `loggedIn: true` かつ `purchases: []` => 未購入
- `purchases` に動画IDあり => 購入済み

## 購入フロー（モック）
- `商品/商品詳細` -> `purchase-confirm.html` -> `thankyou.html` -> `mypage.html`
- 購入確認ページでは、`利用規約とプライバシーポリシーに同意` チェックがないと確定不可

## 会員導線（モック）
- `login.html` から `register.html` へ遷移可能
- `register.html` で登録完了後、ログイン済み状態で遷移

## 実装メモ
- 共通ヘッダー/フッターはテンプレートパーツ化しやすいよう全画面で同一構造。
- 画面ごとの本文は `main` 配下のみ差し替えれば移植可能。
- 状態判定ロジックは `app.js` に集約。実装時は会員状態・購入状態APIに置換。
