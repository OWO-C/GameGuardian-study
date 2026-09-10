# 🛡️ GameGuardian (GG 修改器) 全方位功能指南 & 互動圖譜網站

本網站為 **GameGuardian** 的全方位互動功能導覽圖譜，專為 Android 遊戲模組開發者與逆向研究員打造。採用現代極客暗黑風 (Cyber Dark Aesthetic)，並將 GameGuardian 的所有核心與進階功能梳理為動態樹狀分枝圖。

## 🌟 網站亮點

- 🌲 **六大核心功能分枝圖 (Interactive Feature Tree Graph)**
  - 數值搜尋與資料類型 (`Dword`, `Float`, `Group Search`, `XOR Encrypted`, `Fuzzy`)
  - 記憶體區域選取 (`Anonymous A`, `Code app Xa`, `Java Heap Jh` 等)
  - 位址偏移與指針追蹤 (`Offset`, `Pointer Search`, `ARM64 Hex Viewer`)
  - 速度操控與時間跳躍 (`Speed Hack`, `Time Jump`)
  - Lua 腳本自動化 (`gg.searchNumber`, `gg.choice`, `gg.addListItems`)
  - 反偵測與保護機制 (`Hide GG 1-4`, `Random Package Name`, `Freeze Interval`)
- 🧪 **實戰記憶體搜尋模擬器 (Search Simulator)**：在網頁上模擬 1st / Refine Search 與 Edit All。
- ⚡ **Speed Hack 物理變速試驗場**：實時調控 Canvas 運動物理球與計時器。
- ⚡ **超低 CPU 佔用優化**：內建 `IntersectionObserver` 滾動監速、靜態漸層背景與畫布視窗離界自動暫停機制。

---

## 🚀 如何上傳至 GitHub 並開啟 GitHub Pages 免費託管

### 步驟 1：初始化 Git 倉庫並 commit
在終端機中執行：
```bash
git init
git add .
git commit -m "feat: GameGuardian full feature interactive guide website"
```

### 步驟 2：推送到 GitHub 專案庫
1. 在 GitHub 建立一個新的 Repository（例如 `gameguardian-guide`）。
2. 執行以下指令進行關聯與推送：
```bash
git branch -M main
git remote add origin https://github.com/您的用戶名/gameguardian-guide.git
git push -u origin main
```

### 步驟 3：開啟 GitHub Pages 免費網站
1. 進入 GitHub 專案頁面 -> 點擊 **Settings** (設定)。
2. 在左側選單點擊 **Pages**。
3. 在 **Source** 選項中選擇 `Deploy from a branch`。
4. Branch 選擇 `main` / `/(root)`，點擊 **Save**。
5. 等待 1~2 分鐘，即可獲得免費的公開網站網址：`https://您的用戶名.github.io/gameguardian-guide/`！
