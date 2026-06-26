const express = require("express");
const fs = require("node:fs");
const { formidable } = require("formidable");

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

const uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads";
const maxFileSize = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

fs.mkdirSync(uploadDir, { recursive: true });

const router = express.Router();

// ───────────────────────────────────────────────────────────
// TODO 任務五：POST /
//   （實際 URL 是 /uploadImage，因為 app.js 把這個 router 掛在 '/uploadImage'）
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：multipart/form-data，field 名稱 `image`
// - 輸出：200 + { filename: file.originalFilename, sizeKB: Math.round(file.size / 1024), savedPath: file.filepath }，或 400 + { error: 'No file uploaded' }（沒帶 image）
// - 提示：建立 formidable 實例（uploadDir、keepExtensions: true、maxFileSize），用 form.parse(req, (err, fields, files) => { ... }) 解析，其中 err 不為 null 時回 500 + { error: err.message }
// - 注意：formidable v3 的 files.image 為陣列，需以 Array.isArray 判斷並取 [0]
/* 作答區 */
router.post("/", (req, res) => {
  // 1. 建立 formidable 實例
  const form = formidable({
    uploadDir: uploadDir, // 決定上傳的檔案要被存在哪一個資料夾 (前面宣告的 /tmp/uploads)
    keepExtensions: true, // 是否保留檔案的副檔名 (例如 .jpg、.png)？設為 true 圖片才開得起來
    maxFileSize: maxFileSize, // 限制單一檔案的最大容量 (前面宣告的 5MB)
  });

  // 2. 開始解析前端發過來的 req (請求)
  form.parse(req, (err, fields, files) => {
    // 狀況 A：如果解析過程發生錯誤（例如檔案太大），回傳 500
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 狀況 B：檢查有沒有上傳檔案？而且前端指定的欄位名稱必須是 `image`
    if (!files || !files.image) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 狀況 C：成功拿到檔案！
    // 注意：新版 (v3) 的 formidable 解析出來的 files.image 預設是「陣列」
    // 我們需要判斷它是不是陣列，如果是的話，就取出第一張圖片 [0]
    let file = files.image;
    if (Array.isArray(file)) {
      file = file[0];
    }

    // 成功儲存！照著作業要求，將結果組裝成指定的 JSON 格式回傳給前端
    res.status(200).json({
      filename: file.originalFilename, // 原始檔案名稱
      sizeKB: Math.round(file.size / 1024), // 將檔案大小 (bytes) 轉為 KB 並四捨五入
      savedPath: file.filepath, // 檔案實際存在伺服器上的路徑
    });
  });
});

module.exports = router;
