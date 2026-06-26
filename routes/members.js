const express = require("express");
const initialMembers = require("../fixtures/members.json");

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：初始化 state + 內部 helpers
// ───────────────────────────────────────────────────────────

// 1. 複製 initialMembers，不直接改外部陣列
/* 作答區 */
// 使用展開運算子 (...) 將外部的 JSON 陣列複製成一個全新的陣列，避免修改到原始資料
const members = [...initialMembers];

// 2. 下一個新增會員要使用的 id
/* 作答區 */
// 預設有 4 筆資料，所以下一筆新增的 id 從 5 開始
let nextId = 5;

// 3. 兩個內部 helper 函式

// 函式一：filterByQuery(list, query)：
// - 依據 query.level 篩選，沒帶就回全部
// - 任務二的 GET / 會使用到這個函式
/* 作答區 */
function filterByQuery(list, query) {
  // 檢查 query 物件裡面有沒有 level 這個屬性
  if (query.level) {
    // 透過 filter 篩選出 level 相符的會員，並回傳新陣列
    return list.filter((item) => item.level === query.level);
  }
  // 如果前端沒有帶 level 參數，就直接回傳原本的完整名單
  return list;
}

// 函式二：validateBody(body)
// - 驗證 body 有沒有 name、level 欄位，要擋 null / undefined / {}
// - 驗證通過 → { valid: true }
// - 驗證失敗 → { valid: false, error: '缺 name 或 level' }
// - 任務三的 POST / 會使用到這個函式
/* 作答區 */
function validateBody(body) {
  // 1. 擋掉 null 或 undefined 的 body
  // 2. 檢查有沒有 name 屬性
  // 3. 檢查有沒有 level 屬性
  if (!body || !body.name || !body.level) {
    return { valid: false, error: "缺 name 或 level" };
  }

  // 都有的話，代表驗證通過
  return { valid: true };
}

const router = express.Router();
// 此 router 掛在 app.js 的 '/members'，以下路由皆帶此前綴。舉例來說：
// - router.get('/') → GET /members
// - router.get('/:id') → GET /members/:id

// ───────────────────────────────────────────────────────────
// TODO 任務二：GET / 和 GET /:id
// ───────────────────────────────────────────────────────────

// GET /
// - 輸入：req.query.level 可帶 'VIP' | 'normal'（選填）
// - 輸出：200 + [{ id, name, level }, ...]
// - 提示：filterByQuery(members, req.query)
/* 作答區 */
router.get("/", (req, res) => {
  // 呼叫 helper 函式，把完整的 members 跟前端網址上的 query 傳進去過濾
  const filteredList = filterByQuery(members, req.query);
  // 回傳 200 (OK) 以及過濾後的結果
  res.status(200).json(filteredList);
});

// GET /:id
// - 輸入：req.params.id（string，需使用 Number() 轉換）
// - 輸出：200 + { id, name, level }，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.find，找不到時結果是 undefined
/* 作答區 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  // 把從網址拿到的 id (字串) 轉成數字後，用 find 去陣列找符合的物件
  const filterMember = members.find((item) => item.id === Number(id));

  if (!filterMember) {
    // 找不到時，回傳 404 (Not Found)
    res.status(404).json({ error: "會員不存在" });
  } else {
    // 找到時，回傳 200 (OK) 與該筆會員資料
    res.status(200).json(filterMember);
  }
});

// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：body = { name: string, level: 'VIP' | 'normal' }
// - 輸出：201 + 新會員物件（id 自動配），或 400 + { error: '缺 name 或 level' }（驗證失敗）
// - 提示：validateBody(req.body) 驗證；通過後用 spread 將 req.body 的欄位與 nextId 自動遞增的 id 合為新物件，push 進 members
// - 範例：POST /members body { name: '阿文', level: 'VIP' } → 201 { id: 5, name: '阿文', level: 'VIP' }
/* 作答區 */
router.post("/", (req, res) => {
  // 1. 呼叫 helper 檢查是否有傳入必填的 'name' 與 'level' 欄位
  const validationResult = validateBody(req.body);

  // 2. 判斷驗證結果 (如果 valid 是 false 代表有缺欄位)
  if (validationResult.valid === false) {
    // 把 helper 裡面的錯誤訊息拿出來，回傳給前端 400 (Bad Request)
    return res.status(400).json({ error: validationResult.error });
  }

  // 3. 建立新的會員物件，用 spread (...) 將 req.body 的資料展開並加上自動遞增的 id
  const newMember = { id: nextId, ...req.body };

  // 4. 將新會員加入陣列
  members.push(newMember);
  // 5. 將 nextId 加 1，供下一位新會員使用
  nextId++;

  // 6. 回傳 201 (Created) 表示新增成功，並回傳這筆剛建立的資料
  res.status(201).json(newMember);
});

// ───────────────────────────────────────────────────────────
// TODO 任務四：PUT /:id 和 DELETE /:id
// ───────────────────────────────────────────────────────────

// PUT /:id
// - 輸入：req.params.id（string，需 Number() 轉換）、body（部分欄位，例如只傳 { level: 'normal' }）
// - 輸出：200 + merge 後的會員，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則使用 spread 合併 members[idx] 與 req.body（req.body 需注意順序來覆蓋舊欄位），最後將結果存回 members[idx]
// - 範例：PUT /members/1 body { level: 'normal' } → 200 { id: 1, name: '小華', level: 'normal' }（name 被保留）
/* 作答區 */
router.put("/:id", (req, res) => {
  // 1. 根據網址參數中的 id，尋找該會員在陣列中的「索引位置 (index)」
  const index = members.findIndex((item) => item.id === Number(req.params.id));

  // 2. 若找不到對應的會員 (findIndex 找不到會回傳 -1)，回傳 404 (Not Found)
  if (index === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }

  // 3. 更新資料：把原本的會員資料解開，再把 req.body 解開覆蓋上去
  // (req.body 放後面，才能確保新傳來的欄位能蓋掉舊欄位)
  members[index] = {
    ...members[index],
    ...req.body,
  };

  // 4. 回傳 200 (OK) 表示更新成功，並回傳這筆「被更新過後」的會員資料
  res.status(200).json(members[index]);
});

// DELETE /:id
// - 輸入：req.params.id（string，需 Number() 轉換）
// - 輸出：204（無 body），或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則 splice 移除，再設定 status 204 並以 .end() 結束回應（204 不帶 body）
/* 作答區 */
router.delete("/:id", (req, res) => {
  // 1. 尋找目標會員在陣列中的「索引位置 (index)」
  const index = members.findIndex((item) => item.id === Number(req.params.id));

  // 2. 若找不到該會員 (index 為 -1)，回傳 404 (Not Found) 錯誤
  if (index === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }

  // 3. 使用 splice 將該會員從陣列中移除 (從 index 開始，刪除 1 筆)
  members.splice(index, 1);

  // 4. 回傳 204 (No Content) 表示刪除成功且不需回傳任何內容，直接結束 (.end) 此請求
  res.status(204).end();
});

module.exports = router;
