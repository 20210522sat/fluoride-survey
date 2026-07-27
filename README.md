# 牙膏氟濃度問卷調查 — 部署說明

這個專案包含：
- `public/index.html`：問卷頁面（一次一題，填完自動送出）
- `public/admin.html`：管理後台（密碼登入後可看所有回覆、匯出 CSV）
- `api/submit.js`：接收問卷送出的 API
- `api/responses.js`：管理後台讀取資料用的 API（有密碼保護）

架構：**Vercel（負責網站 + API）+ Supabase（負責資料庫）**，兩個都有免費方案，不需要付錢。

---

## 步驟一：建立 Supabase 專案

1. 到 https://supabase.com 註冊/登入
2. 點 **New Project**，取名字（例如 `fluoride-survey`）、設一組資料庫密碼（記得存起來，等一下用不到但要留底）、選一個離你近的地區
3. 建立完成後，進到專案，左側選 **SQL Editor**，貼上以下 SQL，按 **Run**：

```sql
create table responses (
  id uuid default gen_random_uuid() primary key,
  q1_name text,
  q2_fluoride text,
  q3_image text,
  q4_image text,
  submitted_at timestamptz default now()
);

-- 打開 Row Level Security，且不加任何 policy
-- 這樣用 anon key 從瀏覽器直接打 Supabase 一律會被擋下來
-- 只有後端用的 service_role key 能讀寫這張表（service_role 本來就會跳過 RLS）
alter table responses enable row level security;
```

4. 左側選 **Project Settings → API**，記下兩個東西（等一下部署到 Vercel 會用到）：
   - **Project URL**（長得像 `https://xxxxx.supabase.co`）
   - **service_role key**（在 "Project API keys" 底下，是一長串文字。⚠️ 這組 key 權限很高，絕對不要放到前端程式碼或公開分享，只會用在 Vercel 的環境變數裡）

---

## 步驟二：把專案放到 GitHub

1. 到 https://github.com 建立一個新的 repository（例如叫 `fluoride-survey`），設為 **Private**（比較保險）
2. 把這個資料夾裡的所有檔案上傳上去。最簡單的方式：

```bash
cd 這個資料夾的路徑
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的帳號/fluoride-survey.git
git push -u origin main
```

（如果你比較習慣用 GitHub Desktop 或網頁直接拖曳上傳檔案也可以，效果一樣）

---

## 步驟三：部署到 Vercel

1. 到 https://vercel.com，用 GitHub 帳號登入
2. 點 **Add New → Project**，選你剛剛建立的 `fluoride-survey` repository，點 **Import**
3. 在部署設定頁面，展開 **Environment Variables**，加入三組：

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | 步驟一記下的 Project URL |
   | `SUPABASE_SERVICE_KEY` | 步驟一記下的 service_role key |
   | `ADMIN_PASSWORD` | 你自己設定的管理者密碼，例如 `dentist2026`（建議改成只有你知道的） |

4. 其他設定不用動，點 **Deploy**
5. 等 1-2 分鐘部署完成後，Vercel 會給你一個網址，例如 `https://fluoride-survey.vercel.app`

---

## 完成後怎麼用

- **問卷連結**：`https://你的網址.vercel.app/`
- **管理後台**：`https://你的網址.vercel.app/admin.html`，輸入你在 Vercel 環境變數設定的 `ADMIN_PASSWORD` 就能看到所有回覆，也可以按「匯出 CSV」下載成 Excel 可開的檔案

---

## 之後想改密碼、改題目？

- **改管理密碼**：到 Vercel 專案的 Settings → Environment Variables，改掉 `ADMIN_PASSWORD` 的值，重新部署一次（或等它自動生效）
- **改題目文字/圖片**：直接編輯 `public/index.html`，改完 push 回 GitHub，Vercel 會自動重新部署

---

## 常見問題

**Q: 送出問卷時出現「送出失敗」？**
通常是 Vercel 環境變數沒設對，或 Supabase 的資料表欄位名稱打錯。回去檢查 `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` 有沒有複製完整（很長，容易漏字），以及 SQL 建表有沒有成功執行。

**Q: 管理後台一直說密碼錯誤？**
確認 Vercel 環境變數裡的 `ADMIN_PASSWORD` 跟你輸入的一模一樣（注意大小寫），改完環境變數要重新部署一次才會生效。
