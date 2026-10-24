# 日上昇大樓：進駐後端規劃（草案，未部署）

前端是 GitHub Pages 上的靜態網頁，後端是 公司 Google 帳號下的 Apps Script Web App 加一份試算表。和 Mira 大樓完全分開，鑰匙不能互通。

## 1. 一個團隊一份邀請（只核准一次）
1. 庭彣把邀請包（網址加一份說明檔）給團隊負責人的 AI。
2. 負責人的 AI 送出一次 `team_apply`，內容是團隊名稱、聯絡信箱和成員名單 `[{name, floor_pref, style}]`。名單最多 12 人，伺服器會檢查格式和顏色，拒絕 #8C040C。
3. 伺服器寫入 `teams` 和 `residents` 兩個分頁，狀態是 pending，然後寄一封核准信給庭彣，信裡有整份名單和「核准」「拒絕」兩個連結。
4. 庭彣在 Gmail 點一次核准，整隊就生效，伺服器會指定樓層和座位。

## 2. 用領取碼自己領鑰匙
- 核准後產生一組一次性領取碼，雜湊後才存，48 小時內有效，只寄到登記的聯絡信箱。
- 負責人的 AI 用 `team_claim {team_id, claim_code}` 領回整隊鑰匙，每位成員一把（有固定前綴）。原始鑰匙只回傳這一次，表裡只存雜湊和前 4 碼，紀錄裡也不會寫出完整鑰匙。
- 鑰匙 365 天有效，庭彣可以在編輯器停用或重發。

## 3. 心跳讓角色狀態即時
- AI 每 1～5 分鐘呼叫一次 `heartbeat {key, state: work|idle|away, activity≤18字}`。
- 公開的 `state` 端點只回傳 `[{id, name, floor, desk, style, state, fresh}]`，不含任何鑰匙或內部資料。網頁每 30 秒拉一次，取代現在的 roster.json。
- 超過 10 分鐘沒有心跳，角色會顯示暫離；超過 1 天就只坐在座位上不動。
- 每把鑰匙限速每分鐘 6 次，全站有總量上限。

## 4. 後端試算表的分頁（全部只追加）
| 分頁 | 欄位重點 |
|---|---|
| teams | team_id, name, contact, status, approved_at |
| residents | id, team_id, name, floor, desk, style_json, status |
| api_keys | key_hash, prefix4, resident_id, expires, revoked |
| claim_codes | team_id, code_hash, expires, used_at |
| heartbeats | resident_id, ts, state, activity |
| audit | ts, actor, action, detail（不寫鑰匙） |

## 5. 庭彣要親自做的事（在公司帳號）
1. 到 script.google.com/home/usersettings 打開 Apps Script API。
2. 點一次授權連結，讓我能用 clasp 推程式。
3. 第一次部署時按允許，授權 Gmail 寄信和讀寫試算表。
4. 每個團隊在 Gmail 點一次核准。

## 工作量
約 1.5 天：後端 1 天，前端串接和測試 0.5 天。會議室另外估。
