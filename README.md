# Supabase 対応 ToDo アプリ

このアプリは、`localStorage` ではなく Supabase に ToDo を保存するように変更してあります。  
そのため、同じ URL をスマホや別の PC で開いても、同じ ToDo 一覧を見られます。

## できること

- ToDo の追加
- ToDo の一覧表示
- ToDo の削除
- GitHub Pages での公開
- Supabase を使った複数端末共有

## 1ステップずつ設定する手順

1. Supabase の無料アカウントを作成します。  
   `https://supabase.com/` を開いてサインアップしてください。

2. 新しいプロジェクトを作成します。  
   ダッシュボードで `New project` を押して、プロジェクト名とパスワードを設定します。

3. `SQL Editor` を開きます。  
   左メニューの `SQL Editor` を押します。

4. [supabase/schema.sql](./supabase/schema.sql) の中身をコピーして実行します。  
   これで `todos` テーブルと、認証なしで読み書きするためのポリシーが作られます。

5. Supabase の URL と anon key を確認します。  
   `Project Settings` → `Data API` を開くと、`Project URL` と `anon public` key が見つかります。

6. [config.js](./config.js) を開きます。  
   次の 2 か所を自分の値に書き換えます。

   ```js
   window.SUPABASE_CONFIG = {
     url: "YOUR_SUPABASE_URL",
     anonKey: "YOUR_SUPABASE_ANON_KEY"
   };
   ```

7. ブラウザで `index.html` を開いて動作確認します。  
   ToDo を追加して、Supabase の `Table Editor` でデータが入っているか見てください。

8. GitHub にこのフォルダを push します。  
   `index.html`、`style.css`、`script.js`、`config.js`、`supabase/schema.sql` を含めてアップロードしてください。

9. GitHub Pages を有効にします。  
   GitHub のリポジトリで `Settings` → `Pages` → `Deploy from a branch` を選び、`main` ブランチの `/root` を公開します。

10. 公開された URL をスマホや別の PC で開きます。  
    同じ URL にアクセスすれば、同じ ToDo 一覧が表示されます。

## Supabase 接続をもっと詳しくやる手順

ここは、Supabase を初めて使う人向けに、画面のどこを押すかをできるだけ細かく書いています。  
まずは GitHub Pages に上げる前に、手元で `index.html` を開いて接続確認するのがおすすめです。

### 1. Supabase のアカウントを作る

1. ブラウザで `https://supabase.com/` を開きます。
2. 右上の `Start your project` か `Sign in` を押します。
3. GitHub か Google など、使いやすい方法でログインします。
4. ログインできたら、Supabase のダッシュボード画面に入ります。

### 2. 新しいプロジェクトを作る

1. ダッシュボードで `New project` を押します。
2. もし Organization を選ぶ画面が出たら、自分のアカウント用の Organization を選びます。
3. `Name` に好きなプロジェクト名を入れます。  
   例: `todo-list-app`
4. `Database Password` にパスワードを入れます。  
   これはあとで使うことがあるので、忘れないように控えてください。
5. `Region` は、近い場所を選びます。  
   日本なら `Northeast Asia (Tokyo)` など近い地域がおすすめです。
6. 入力できたら、画面下の `Create new project` を押します。
7. 1〜2分ほど待つと、プロジェクトが作成されます。

### 3. SQL Editor を開いてテーブルを作る

1. プロジェクト画面の左メニューを見ます。
2. `SQL Editor` をクリックします。
3. 右上または中央にある `New query` をクリックします。
4. 新しい SQL 入力画面が開いたら、下の SQL をそのまま全部貼り付けます。

```sql
create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) <= 100),
  deadline date,
  category text not null default '未分類' check (char_length(category) <= 30),
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

create policy "Anyone can read todos"
on public.todos
for select
to anon
using (true);

create policy "Anyone can insert todos"
on public.todos
for insert
to anon
with check (true);

create policy "Anyone can delete todos"
on public.todos
for delete
to anon
using (true);
```

5. 貼り付けたら、右下か右上にある `Run` を押します。
6. エラーが出なければ、`todos` テーブルの作成は完了です。

### 4. テーブルができたか確認する

1. 左メニューの `Table Editor` をクリックします。
2. 一覧の中に `todos` というテーブルがあれば成功です。
3. クリックすると、まだデータが 0 件のテーブル画面が開きます。

### 5. Project URL と anon public key を確認する

1. 左メニューの一番下あたりにある歯車アイコンの `Project Settings` をクリックします。
2. 設定画面が開いたら、左側のメニューで `Data API` をクリックします。  
   Supabase のバージョンによっては `API` と表示されることもあります。
3. 画面を少し下に見ると、次の情報があります。
   - `Project URL`
   - `anon public`
4. `Project URL` の右にあるコピーアイコンを押して、値をコピーします。
5. `anon public` key の右にある `Reveal` やコピーアイコンを押して、キーをコピーします。

例:

- Project URL  
  `https://abcde12345.supabase.co`
- anon public key  
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 6. config.js を書き換える

1. このプロジェクトの [config.js](./config.js) を開きます。
2. 今は次のようになっています。

```js
window.SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

3. `"YOUR_SUPABASE_URL"` を、さっきコピーした `Project URL` に置き換えます。
4. `"YOUR_SUPABASE_ANON_KEY"` を、さっきコピーした `anon public key` に置き換えます。

書き換え例:

```js
window.SUPABASE_CONFIG = {
  url: "https://abcde12345.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-example-example"
};
```

5. 保存したら準備完了です。

### 7. 接続できたか確認する

1. ブラウザで `index.html` を開きます。
2. 入力欄に、たとえば次のように入れます。
   - やること: `牛乳を買う`
   - 締切: 今日の日付
   - カテゴリ: `買い物`
3. `追加` ボタンを押します。
4. 画面に ToDo が追加されたら、いったん成功の可能性が高いです。
5. 次に Supabase の `Table Editor` → `todos` を開きます。
6. 追加した内容が 1 行増えていれば、Supabase への保存成功です。
7. さらに別のブラウザ、別の PC、またはスマホで同じページを開きます。
8. 同じ ToDo が見えれば、複数端末共有も成功です。

### 8. GitHub Pages に公開したあと確認する

1. GitHub にファイルを push します。
2. GitHub のリポジトリで `Settings` → `Pages` を開きます。
3. `Deploy from a branch` を選びます。
4. `main` ブランチの `/root` を選んで保存します。
5. 数分待って公開 URL が出たら、その URL を開きます。
6. スマホでも同じ URL を開いて、同じ ToDo が見えるか確認します。

## よくあるエラーと確認ポイント

### 1. 画面に「config.js の Supabase URL を設定してください。」と出る

確認ポイント:

- [config.js](./config.js) の `url` がまだ `"YOUR_SUPABASE_URL"` のままではないか
- コピペした URL の前後に余計な空白が入っていないか
- `https://` から始まる URL を入れているか

### 2. 画面に「config.js の anon key を設定してください。」と出る

確認ポイント:

- [config.js](./config.js) の `anonKey` がまだ `"YOUR_SUPABASE_ANON_KEY"` のままではないか
- `anon public` key をコピーしたか
- `service_role` key を間違えて使っていないか  
  `service_role` は秘密情報なので、フロントエンドに入れてはいけません

### 3. ToDo を追加しても保存されない

確認ポイント:

- `SQL Editor` で SQL を最後まで全部実行したか
- `Table Editor` に `todos` テーブルがあるか
- `Run` 後にエラーが出ていなかったか
- `config.js` の URL と key が別プロジェクトのものになっていないか

### 4. 一覧が表示されない、または削除できない

確認ポイント:

- `supabase/schema.sql` の RLS ポリシーを作成できているか
- `Table Editor` の `todos` にデータが入っているか
- ブラウザを再読み込みすると変わるか
- 数秒待つと表示されるか  
  このアプリは 10 秒ごとに自動更新しています

### 5. GitHub Pages では動かないのに、ローカルでは動く

確認ポイント:

- GitHub に `config.js` も含めて push したか
- GitHub Pages の公開先ブランチが正しいか
- 公開 URL が古いキャッシュを見ていないか  
  ブラウザの再読み込みを試してください

### 6. スマホで見ても同じ ToDo が表示されない

確認ポイント:

- スマホで開いている URL が PC と同じか
- PC 側で追加した内容が Supabase の `Table Editor` に実際に保存されているか
- スマホ側でページを再読み込みしたか

### 7. セキュリティ面で不安

確認ポイント:

- 今回は認証なしなので、URL を知っている人は誰でも読み書きできます
- `anon public key` は公開前提ですが、`service_role key` は絶対に公開しないでください
- 本番で個人用に使いたいなら、次の段階で Supabase Auth を追加してください

## Supabase のテーブル設計

最小構成として、次の設計にしています。

| カラム名 | 型 | 説明 |
| --- | --- | --- |
| `id` | `uuid` | ToDo を一意に識別する ID |
| `text` | `text` | やることの本文 |
| `deadline` | `date` | 締切日。未設定でも可 |
| `category` | `text` | カテゴリ。未入力なら `未分類` |
| `created_at` | `timestamptz` | 作成日時 |

## セキュリティ上の注意

- `anon key` はフロントエンドに置く前提のキーです。  
  ただし、完全な秘密情報ではありません。GitHub Pages に置くと、利用者から見える状態になります。

- 今回は「認証なしの最小構成」のため、同じ URL を知っている人は誰でも ToDo を読んだり追加したり削除したりできます。  
  つまり、公開 URL を知っている全員で共有するメモ帳に近い動きです。

- 本当に自分だけの ToDo にしたい場合は、次の段階で Supabase Auth を追加してください。  
  そのうえで RLS を「自分のデータだけ読める」形に変更すると安全になります。

## どのファイルを変更したか

- [index.html](./index.html)  
  Supabase の CDN と `config.js` を読み込むように変更しました。  
  あわせて、説明文とステータスメッセージ表示欄を追加しました。

- [script.js](./script.js)  
  `localStorage` を使う処理を削除し、Supabase から `select` / `insert` / `delete` する形に変更しました。  
  別端末の変化も追いやすいように、10 秒ごとの再読込も入れています。

- [style.css](./style.css)  
  スマホでも見やすいように見た目を少し整えました。  
  ステータスメッセージや空状態の表示も追加しています。

- [config.js](./config.js)  
  Supabase の URL と anon key を入れる設定ファイルです。

- [supabase/schema.sql](./supabase/schema.sql)  
  テーブル作成と RLS ポリシー設定用の SQL です。

## 補足

- GitHub Pages は静的ファイル配信なので、今回のような HTML / CSS / JavaScript + Supabase の構成と相性がよいです。
- 認証をまだ入れていないので、まずは「複数端末で同じ ToDo が見える」最小構成として使うのがおすすめです。
