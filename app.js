/**
 * GameGuardian Master Reference & Interactive Branch Visualizer
 * Core Application Engine - Optimized for High Performance & Low CPU Usage
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Modules
  initBranchTree();
  initSearchSimulator();
  initSpeedHackSimulator();
  initMemoryMap();
  initLuaWorkshop();
  initGlobalSearchAndFilter();
  initModalEvents();

  // Initial SVG connections draw (throttled)
  requestAnimationFrame(() => {
    setTimeout(drawTreeConnections, 100);
  });

  // Window resize handler with requestAnimationFrame throttling
  window.addEventListener('resize', throttle(() => {
    requestAnimationFrame(drawTreeConnections);
  }, 100));
});

/* ==========================================================================
   1. GameGuardian Branch Tree Knowledge Base & Engine
   ========================================================================== */

const BRANCH_DATA = [
  {
    id: 'branch-search',
    category: 'search',
    name: '數值搜尋與資料類型',
    icon: 'fa-magnifying-glass',
    color: '#00f2fe',
    glow: 'rgba(0, 242, 254, 0.4)',
    subNodes: [
      {
        id: 'node-dword',
        title: 'Dword (4 Bytes - 整數)',
        badge: 'TYPE_DWORD',
        concept: 'Dword (Double Word) 為 32 位元有符號/無符號整數，佔用 4 個位元組。這是 GameGuardian 中最常用、最普遍的數據型態，適用於 90% 的遊戲金幣、等級、道具數量、經驗值等整數標的。',
        steps: [
          '開啟 GameGuardian，點擊放大鏡搜尋圖示。',
          '在「數值」欄位輸入當前遊戲中的金額或經驗值（如：`1000`）。',
          '「類型」選擇 **Dword (D)**。',
          '執行搜尋，等待搜尋完畢後回到遊戲消耗或增加金幣（使數值變為 `950`）。',
          '再次開啟 GG，輸入新數值 `950` 執行「再次搜尋」，直至殘留少量位址即可雙擊修改。'
        ],
        code: `gg.searchNumber("1000", gg.TYPE_DWORD, false, gg.SIGN_EQUAL, 0, -1)\nlocal results = gg.getResults(10)\ngg.editAll("9999999", gg.TYPE_DWORD)`,
        tip: '若遊戲為 Unity 引擎開發，大部分整數欄位（如金幣數量）皆為 Standard 32-bit Dword。'
      },
      {
        id: 'node-float',
        title: 'Float (4 Bytes - 單精度浮點數)',
        badge: 'TYPE_FLOAT',
        concept: 'Float 是 IEEE 754 標準的 32 位元浮點數，包含小數點。多用於遊戲中的角色血量 (HP)、魔力 (MP)、移動速度、技能冷卻時間 (CD) 以及 3D 空間坐標 (X, Y, Z)。',
        steps: [
          '搜尋類型選擇 **Float (F)**。',
          '搜尋具備小數特性的數值（例如當前血量 `100.0` 或百分比 `1.0`）。',
          '如果遊戲顯示為 `100` 但搜尋 Dword 找不到，極有可能是 Float 儲存！',
          '若血量不確定精確小數點，可使用範圍搜尋（如 `99.9~100.1`）。'
        ],
        code: `gg.searchNumber("100.0~100.5", gg.TYPE_FLOAT, false, gg.SIGN_EQUAL, 0, -1)\ngg.getResults(100)\ngg.editAll("9999.0", gg.TYPE_FLOAT)`,
        tip: '血量修改時，常可搭配「後台鎖定 (Freeze)」防止遊戲物理引擎在下一影格將數值覆蓋回原狀。'
      },
      {
        id: 'node-group',
        title: 'Group Search (聯合搜尋 / 結構組搜尋)',
        badge: '100;200;500::9',
        concept: '聯合搜尋允許一次性在相鄰的記憶體空間中搜尋多個不同的數值與數據結構。例如：角色血量 (100)、攻擊力 (200)、防禦力 (500) 往往保存在同一個 C++ 結構體 (Struct) 中，位址差距極近。',
        steps: [
          '語法格式為：`數值1;數值2;數值3::最大位址距離`。',
          '例如在搜尋框輸入 `100;200;500::16`（代表這三個數值彼此位址差距在 16 個 Byte 以內）。',
          '點擊搜尋後，GG 會鎖定整個結構體群組。',
          '點擊「聯合搜尋變更」，輸入特定項目（如只篩選出 `200`）進行單獨提純與修改。'
        ],
        code: `gg.searchNumber("100;200;500::16", gg.TYPE_DWORD, false, gg.SIGN_EQUAL, 0, -1)\ngg.refineNumber("200", gg.TYPE_DWORD)\ngg.editAll("99999", gg.TYPE_DWORD)`,
        tip: '聯合搜尋是破解動態改變數值或加密遊戲最強大的技術之一！'
      },
      {
        id: 'node-xor',
        title: 'XOR 加密數據搜尋 (Encrypted Search)',
        badge: 'XOR Key',
        concept: '許多現代手遊為了防修改，會在記憶體中將實體數值與一個隨機生成的 XOR 密鑰 (Key) 進行異或運算加密。直接搜尋看到的數值無法搜到。GG 內建對常見異或與模糊加密數據的自動解密搜尋演算法。',
        steps: [
          '在搜尋介面勾選「加密 (XOR / Encrypted)」選項。',
          '輸入遊戲畫面上顯示的真實數值（如 `5000`）。',
          'GG 會自動演算 `5000 XOR Key` 的多重可能性並進行記憶體特徵比對。',
          '找到目標位址後，修改時 GG 亦會自動重新加密儲存。'
        ],
        code: `gg.searchNumber("5000", gg.TYPE_DWORD, true, gg.SIGN_EQUAL, 0, -1)`,
        tip: '如果加密搜尋耗時較長，建議在「記憶體區域」中僅勾選 Anonymous (A) 區段以大幅提速。'
      },
      {
        id: 'node-fuzzy',
        title: 'Fuzzy Search (未知 / 模糊數值搜尋)',
        badge: 'FUZZY',
        concept: '當遊戲畫面上沒有顯示明確數字（例如只有一條未標示數值的血條），或數值經過複雜轉換時使用。透過「變動」、「未變動」、「增加」、「減少」進行邏輯逼近。',
        steps: [
          '點擊放大鏡 -> 選擇「未知搜尋 (Fuzzy Search)」。',
          '選擇資料類型（如 Auto 或 Float）。',
          '回到遊戲受到傷害（血量減少） -> 開啟 GG 選擇「減少了 (Decreased)」。',
          '回到遊戲打補血包（血量增加） -> 開啟 GG 選擇「增加了 (Increased)」。',
          '保持遊戲不動 -> 開啟 GG 選擇「未變動 (Unchanged)」。多次逼近至剩餘少量位址。'
        ],
        code: `gg.searchNumber("", gg.TYPE_AUTO, false, gg.SIGN_FUZZY)\n-- 扣血後\ngg.refineNumber("", gg.TYPE_AUTO, false, gg.SIGN_FUZZY_LESS)`,
        tip: '多次「未變動」篩選能極速剔除背景運算的動態干擾記憶體。'
      }
    ]
  },
  {
    id: 'branch-regions',
    category: 'regions',
    name: '記憶體區域選取 (Ranges)',
    icon: 'fa-memory',
    color: '#9d4edd',
    glow: 'rgba(157, 78, 221, 0.4)',
    subNodes: [
      {
        id: 'node-region-a',
        title: 'Anonymous (A - 匿名記憶體)',
        badge: 'REGION_ANONYMOUS',
        concept: 'C/C++ 動態記憶體分配 (malloc / new) 的主要儲存區域，也是 Unity 引擎 (Mono / IL2CPP) 堆疊對象與所有動態遊戲角色的資料基地。90% 以上的遊戲數值均在此區段。',
        steps: [
          '點擊 GG 設定選單 -> 「選擇記憶體區域」。',
          '將預設的全部勾選清空，僅勾選 **Anonymous (A)**。',
          '此操作可使記憶體搜尋速度提升 5~10 倍！'
        ],
        code: `gg.setRanges(gg.REGION_ANONYMOUS)`,
        tip: '若搜尋不到目標，再嘗試額外勾選 C_alloc 或 Java Heap。'
      },
      {
        id: 'node-region-xa',
        title: 'Code app (Xa - 應用程式碼段)',
        badge: 'REGION_CODE_APP',
        concept: '存放遊戲 Native 執行庫 (`libil2cpp.so`, `libmain.so`, `libcocos2d.so`) 的機器碼指令區塊（ARM / ARM64 彙編指令）。修補此區段可以實現「無敵」、「無冷卻」、「無限子彈」等功能。',
        steps: [
          '記憶體區域選擇 **Code app (Xa)**。',
          '搜尋特徵碼 Hex 位元組陣列 (ByteArray)，如 `00 00 A0 E3 1E FF 2F E1`。',
          '找到相應函數進入位址後，將指令修改為 `NOP` 或 `MOV R0, #1; BX LR` (Return true)。'
        ],
        code: `gg.setRanges(gg.REGION_CODE_APP)\ngg.searchNumber("h 00 00 A0 E3", gg.TYPE_BYTE)`,
        tip: '修改 Code app 區段通常需要配合 Bypass 手段，因為現代遊戲會有 CRC32 / MD5 記憶體驗證。'
      },
      {
        id: 'node-region-jh',
        title: 'Java Heap (Jh - Java 堆疊)',
        badge: 'REGION_JAVA_HEAP',
        concept: 'Android Dalvik / ART 虛擬機器託管的 Java 對象記憶體區塊。常見於原生 Android Java 開發的 2D 遊戲或應用程式變數。',
        steps: [
          '記憶體區域勾選 **Java Heap (Jh)**。',
          '進行一般 Dword 或 String 搜尋。'
        ],
        code: `gg.setRanges(gg.REGION_JAVA_HEAP)`,
        tip: '大型 3D 遊戲 (Unity/Unreal) 的核心邏輯不在此區，可安心取消勾選以節省搜尋時間。'
      }
    ]
  },
  {
    id: 'branch-pointer',
    category: 'pointer',
    name: '位址偏移與深層指針',
    icon: 'fa-link',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.4)',
    subNodes: [
      {
        id: 'node-offset',
        title: 'Address Offset (位址偏移量計算)',
        badge: '+0x4 / +0x8',
        concept: '在物件導向程式設計中，一個物件的所有變數在記憶體中連續排列。若已找到角色的「血量位址」，可透過十六進位加減計算推出相鄰的「攻擊力位址」或「金幣位址」。',
        steps: [
          '長按已搜尋到的血量位址 (例如 `0x7b4a2c10`)，選擇「轉到該位址 (Goto Address)」。',
          '觀察周圍 16 進位數據結構。',
          '點擊「偏移量計算」，輸入 `+0x4` 或 `+0x14` 即可精準推算相鄰欄位位址。'
        ],
        code: `local baseAddr = 0x7b4a2c10\nlocal attackAddr = baseAddr + 0x14\ngg.setValues({{address = attackAddr, flags = gg.TYPE_DWORD, value = 9999}})`,
        tip: '配合 GG 的「保存清單 (Save List)」可以直接將推算出的新位址加入鎖定陣列。'
      },
      {
        id: 'node-pointer-search',
        title: 'Pointer Search (多層級指針追蹤)',
        badge: 'POINTER SEARCH',
        concept: '遊戲每次重啟，動態記憶體 (Anonymous) 的位址都會改變。指針 (Pointer) 是指儲存了另一個記憶體位址的變數。透過尋找基址 (Base Address) 與基址指針鏈，可以實現「永遠不需要重新搜尋，腳本一鍵鎖定」！',
        steps: [
          '搜尋到當前血量位址 `A` (例如 `0x75001234`)。',
          '長按位址 `A` -> 選擇「指針搜尋 (Pointer Search)」。',
          '設置最大偏移搜尋範圍（例如 `1024` Byte）與多層層級（Level 1~4）。',
          'GG 會掃描記憶體中所有指向 `A` 的指針位址，重啟遊戲後對比出唯一固定基址。'
        ],
        code: `-- 基址 + 雙重偏移量讀取\nlocal base = 0x7b000000\nlocal ptr1 = gg.getValues({{address = base + 0x40, flags = gg.TYPE_QWORD}})[1].value\nlocal finalAddr = ptr1 + 0x18`,
        tip: '在 64 位元 Android 系統中，指針類型必須選擇 Qword (8 Bytes)！'
      },
      {
        id: 'node-hex-editor',
        title: 'Hex Editor & Assembly Viewer (彙編檢視)',
        badge: 'ARM / ARM64',
        concept: 'GG 內建完整的記憶體 16 進位編輯器與 ARM32 / ARM64 彙編指令反組譯器，可直接閱讀並改寫底層機器碼。',
        steps: [
          '長按任意位址 -> 點擊「記憶體檢視器 (Memory Hex Viewer)」。',
          '切換視圖模式為 Assembly (反組譯)。',
          '尋找如 `SUB W0, W0, W1` (扣除血量/子彈指令)，雙擊將其替換為 `NOP` (無動作) 或 `ADD W0, W0, W1` (不扣反加)。'
        ],
        code: `gg.disassemble(gg.TYPE_ARM64, 0x7b001000)`,
        tip: 'ARM64 中最常用的 NOP 指令 Hex 為 `1F 20 03 D5`。'
      }
    ]
  },
  {
    id: 'branch-speed',
    category: 'speed',
    name: '速度操控與時間跳躍',
    icon: 'fa-bolt',
    color: '#ffb703',
    glow: 'rgba(255, 183, 3, 0.4)',
    subNodes: [
      {
        id: 'node-speedhack-core',
        title: 'Speed Hack 遊戲加速器',
        badge: '0.1x ~ 1000x',
        concept: 'GameGuardian 透過 Hook Android 系統層級的計時函數 (`gettimeofday`, `clock_gettime`)，對傳遞給遊戲邏輯的時間 delta 值進行乘法縮放，進而實現遊戲的「全局加速」與「慢動作減速」。',
        steps: [
          '長按 GG 浮動圖示 -> 開啟變速器控制條。',
          '點擊 `>` 加速或 `<` 減速（例如調整為 `5.0x`）。',
          '適用於快速通過劇情、加速放置遊戲採集，或以 `0.2x` 慢動作挑戰高難度音遊/動作遊戲。'
        ],
        code: `gg.setSpeed(5.0)`,
        tip: '若遊戲發生卡頓或閃退，可進入 GG 設定 -> 調整「變速器函數攔截選項 (Functions to Hook)」。'
      },
      {
        id: 'node-time-jump',
        title: 'Time Jump (時間跳躍)',
        badge: 'TIME JUMP',
        concept: '直接向遊戲系統時間發送跳躍訊號，讓遊戲以為已經過去了數個小時。針對根據本地時間計算收益的離線/放置類遊戲效果顯著。',
        steps: [
          '開啟 GG 菜單 -> 選擇「時間跳躍 (Time Jump)」。',
          '輸入欲跳躍的時間（例如 `3600` 秒 = 1小時）。',
          '點擊執行，遊戲內冷卻時間與建築建造將即刻完成。'
        ],
        code: `gg.timeJump("3600")`,
        tip: '網路連線同步伺服器時間的 MMORPG 無法使用時間跳躍。'
      }
    ]
  },
  {
    id: 'branch-lua',
    category: 'lua',
    name: 'Lua 腳本自動化',
    icon: 'fa-code',
    color: '#00f2fe',
    glow: 'rgba(0, 242, 254, 0.4)',
    subNodes: [
      {
        id: 'node-lua-api',
        title: 'gg.searchNumber & gg.editAll',
        badge: 'gg.searchNumber',
        concept: 'GameGuardian 內建高效 Lua 5.3 直譯器。使用 `gg.searchNumber` 搭配 `gg.editAll` 可以將繁瑣的幾十個修改步驟打包成一鍵腳本。',
        steps: [
          '編寫 `.lua` 檔案，呼叫 `gg.clearResults()` 清空快取。',
          '呼叫 `gg.searchNumber("1000", gg.TYPE_DWORD)` 執行自動搜尋。',
          '透過 `gg.getResults(count)` 取得結果陣列，並呼叫 `gg.editAll("99999", gg.TYPE_DWORD)` 批量寫入。'
        ],
        code: `gg.clearResults()\ngg.setRanges(gg.REGION_ANONYMOUS)\ngg.searchNumber("1000", gg.TYPE_DWORD)\ngg.editAll("999999", gg.TYPE_DWORD)\ngg.toast("修改完成！")`,
        tip: '利用 `gg.toast("提示訊息")` 可以給使用者友善的即時視訊反饋。'
      },
      {
        id: 'node-lua-ui',
        title: 'gg.choice & gg.prompt (圖形介面選單)',
        badge: 'gg.choice',
        concept: 'Lua 引擎提供豐富的原生 UI 元件，允許開發者製作具備選擇框、複選按鈕與文字輸入框的極富質感外掛選單。',
        steps: [
          '使用 `gg.choice({"無限血量", "一擊必殺", "遊戲加速"}, nil, "請選擇功能")` 建立選單。',
          '根據回傳的索引值 (Index) 執行不同的修改分支。'
        ],
        code: `local menu = gg.choice({"1. 無限血量", "2. 999999 金幣", "3. 離開"}, nil, "GG 專業選單")\nif menu == 1 then EditGold() end\nif menu == 2 then FreezeHP() end\nif menu == 3 then gg.setSpeed(3.0) end\nif menu == 4 then os.exit() end\nend\n\nfunction EditGold()\n    gg.clearResults()\n    gg.searchNumber("1000", gg.TYPE_DWORD)\n    gg.editAll("999999", gg.TYPE_DWORD)\n    gg.toast("金幣修改成功")\nend\n\nfunction FreezeHP()\n    gg.toast("血量凍結成功")\nend\n\nwhile true do\n    if gg.isVisible(true) then\n        gg.setVisible(false)\n        MainMenu()\n    end\n    gg.sleep(100)\nend`,
        tip: '使用 while 迴圈包裹 UI 選單可實現選單點擊後不退出、重複操作的流暢體驗。'
      },
      {
        id: 'node-lua-freeze',
        title: 'gg.addListItems & 記憶體凍結 (Freeze)',
        badge: 'gg.addListItems',
        concept: '將搜尋到的關鍵記憶體位址加入 GG 的後台保存清單，並啟動鎖定 Flag (Freeze = true)，確保遊戲物理引擎在循環運算中無法覆蓋該數值。',
        steps: [
          '構建包含 `address`, `flags`, `value`, `freeze` 欄位的 Table。',
          '呼叫 `gg.addListItems(items)` 將項目注入後台守護程序。'
        ],
        code: `local item = {}\nitem[1] = {\n  address = 0x7b4a2c10,\n  flags = gg.TYPE_DWORD,\n  value = "9999",\n  freeze = true\n}\ngg.addListItems(item)`,
        tip: '後台凍結頻率可在 GG 的「凍結間隔」選項中微調。'
      }
    ]
  },
  {
    id: 'branch-bypass',
    category: 'bypass',
    name: '反偵測與保護機制',
    icon: 'fa-user-shield',
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.4)',
    subNodes: [
      {
        id: 'node-hide-gg',
        title: 'Hide GameGuardian from App (1, 2, 3, 4)',
        badge: 'HIDE FROM APP',
        concept: '遊戲常常透過掃描 Linux `proc/self/status` 或進程記憶體配對，檢查是否有名為 GG 的特徵處理程序在調試自己。GG 提供 1 ~ 4 級的硬核進程防護隱藏模式。',
        steps: [
          '開啟 GG 設定 -> 「對遊戲隱藏 GameGuardian」。',
          '勾選 **2, 3, 4**（包含隱藏記憶體空間與標頭檔偽裝）。',
          '搭配「隨機套件名稱 (Random Package Name)」安裝 installer。'
        ],
        code: `gg.setVisible(false)`,
        tip: '啟動最高隱藏級別可防止 95% 以上的反作弊系統 (EAC / Tencent ACE / MTP) 掃描。'
      },
      {
        id: 'node-random-pkg',
        title: 'Random Package Installation (隨機包名與圖示偽裝)',
        badge: 'RANDOM APK',
        concept: 'GameGuardian 官方安裝包在安裝時會自動重新編譯自身，生成完全隨機的 Package Name（如 `com.x9a8f.q21z`）與應用名稱，徹底瓦解遊戲掃描 `com.gameguardian` 安裝路徑的檢測。',
        steps: [
          '重新執行 GameGuardian Installer。',
          '選擇「為 64 位元/32 位元遊戲安裝」。',
          '系統將現場導出包含隨機包名與自訂圖示的新 APK。'
        ],
        code: `-- 系統層級動態防護`,
        tip: '建議每次更新 GG 時均重新生成一次全新的隨機包名。'
      },
      {
        id: 'node-freeze-interval',
        title: 'Freeze Interval & Stealth Tuning (凍結間隔與調教)',
        badge: 'INTERVAL TUNING',
        concept: '過於頻繁的記憶體寫入鎖定 (Freeze) 會產生高額 CPU 占用並觸發反作弊系統的頻率監視。調整凍結間隔毫秒數 (ms) 可大幅降低被安全機制鎖定的機率。',
        steps: [
          '進入 GG 設定 -> 「凍結間隔 (Freeze Interval)」。',
          '將預設的 33ms 調整為 100ms 或 200ms。',
          '在滿足遊戲內鎖定需求的前提下極小化特徵留存。'
        ],
        code: `-- 設定優化參數`,
        tip: '對於非即時 PvP 遊戲，200ms 的凍結間隔體驗感完全一致且極其安全。'
      }
    ]
  }
];

// Initialize Branch Tree DOM
function initBranchTree() {
  const container = document.getElementById('branches-wrapper');
  if (!container) return;

  container.innerHTML = '';

  const fragment = document.createDocumentFragment();

  BRANCH_DATA.forEach(branch => {
    const card = document.createElement('div');
    card.className = 'main-branch-card';
    card.id = branch.id;
    card.dataset.category = branch.category;
    card.style.setProperty('--branch-accent', branch.color);
    card.style.setProperty('--branch-glow', branch.glow);

    const subCount = branch.subNodes.length;

    card.innerHTML = `
      <div class="branch-header" onclick="toggleBranchCard('${branch.id}')">
        <div class="branch-title-group">
          <div class="branch-icon"><i class="fa-solid ${branch.icon}"></i></div>
          <div>
            <div class="branch-name">${branch.name}</div>
            <div class="branch-count">${subCount} 個深度子功能節點</div>
          </div>
        </div>
        <i class="fa-solid fa-chevron-down toggle-icon"></i>
      </div>

      <div class="sub-nodes-container" id="${branch.id}-subs">
        ${branch.subNodes.map(node => `
          <div class="sub-node-item" id="${node.id}" onclick="openFeatureModal('${branch.id}', '${node.id}')">
            <div class="sub-node-info">
              <span class="sub-node-bullet"></span>
              <span class="sub-node-title">${node.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="sub-node-badge">${node.badge}</span>
              <i class="fa-solid fa-arrow-right-long sub-node-arrow"></i>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Attach All/Expand/Collapse Events
  document.getElementById('expand-all-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.main-branch-card').forEach(c => c.classList.remove('collapsed'));
    requestAnimationFrame(() => setTimeout(drawTreeConnections, 150));
  });

  document.getElementById('collapse-all-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.main-branch-card').forEach(c => c.classList.add('collapsed'));
    requestAnimationFrame(() => setTimeout(drawTreeConnections, 150));
  });
}

function toggleBranchCard(branchId) {
  const card = document.getElementById(branchId);
  if (card) {
    card.classList.toggle('collapsed');
    requestAnimationFrame(() => setTimeout(drawTreeConnections, 150));
  }
}

// Draw SVG Bezier Curve Lines Connecting Root to Main Branches (Throttled & Batch Rendered)
function drawTreeConnections() {
  const svg = document.getElementById('tree-connections');
  const rootNode = document.querySelector('.tree-root-node');
  const branchCards = document.querySelectorAll('.main-branch-card');
  const treeContainer = document.getElementById('branch-tree-container');

  if (!svg || !rootNode || !treeContainer) return;

  const containerRect = treeContainer.getBoundingClientRect();
  const rootRect = rootNode.getBoundingClientRect();

  const startX = rootRect.left + rootRect.width / 2 - containerRect.left;
  const startY = rootRect.bottom - containerRect.top;

  let svgContent = '';

  branchCards.forEach(card => {
    if (card.offsetParent === null) return; // Hidden by filter

    const cardRect = card.getBoundingClientRect();
    const endX = cardRect.left + cardRect.width / 2 - containerRect.left;
    const endY = cardRect.top - containerRect.top;

    const controlY1 = startY + (endY - startY) * 0.45;
    const controlY2 = startY + (endY - startY) * 0.55;

    const pathD = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;
    const accentColor = card.style.getPropertyValue('--branch-accent') || '#00f2fe';

    svgContent += `
      <path d="${pathD}" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.35" stroke-dasharray="4 4"/>
      <circle cx="${endX}" cy="${endY}" r="4" fill="${accentColor}" />
    `;
  });

  svg.innerHTML = svgContent;
}

/* ==========================================================================
   2. Interactive Memory Search Simulator Engine
   ========================================================================== */

let simMemoryPool = [];
let simSearchResults = [];
let isFirstSearchDone = false;

function initSearchSimulator() {
  resetSimMemory();

  document.getElementById('sim-btn-first')?.addEventListener('click', executeFirstSearch);
  document.getElementById('sim-btn-refine')?.addEventListener('click', executeRefineSearch);
  document.getElementById('sim-btn-reset')?.addEventListener('click', resetSimMemory);
  document.getElementById('sim-btn-edit-all')?.addEventListener('click', executeBatchEdit);
}

function resetSimMemory() {
  simMemoryPool = [];
  simSearchResults = [];
  isFirstSearchDone = false;

  const types = ['Dword', 'Float'];
  const regions = ['Anonymous (A)', 'C_alloc', 'Java Heap (Jh)'];

  for (let i = 0; i < 500; i++) {
    const baseAddr = 0x7b4a0000 + i * 4;
    const type = types[Math.floor(Math.random() * types.length)];
    let val;
    if (type === 'Dword') {
      val = [1000, 500, 99, 1000, 250, 42, 1000, 8888, 1000][Math.floor(Math.random() * 9)];
    } else {
      val = (Math.random() * 100).toFixed(1);
    }
    simMemoryPool.push({
      addr: '0x' + baseAddr.toString(16).toUpperCase(),
      type: type,
      val: val,
      region: regions[Math.floor(Math.random() * regions.length)]
    });
  }

  simMemoryPool[12] = { addr: '0x7B4A0030', type: 'Dword', val: 100, region: 'Anonymous (A)' };
  simMemoryPool[13] = { addr: '0x7B4A0034', type: 'Dword', val: 200, region: 'Anonymous (A)' };
  simMemoryPool[14] = { addr: '0x7B4A0038', type: 'Dword', val: 500, region: 'Anonymous (A)' };

  document.getElementById('sim-btn-refine').disabled = true;
  document.getElementById('sim-btn-edit-all').disabled = true;
  document.getElementById('sim-result-status').innerText = '數據庫已初始化 (500 條模擬紀錄)';
  renderSimTable([]);
}

function executeFirstSearch() {
  const type = document.getElementById('sim-search-type').value;
  const queryVal = document.getElementById('sim-search-val').value.trim();

  if (!queryVal) {
    alert('請輸入欲搜尋的數值或語法！');
    return;
  }

  if (type === 'Group') {
    simSearchResults = simMemoryPool.filter((item) => {
      return item.val == 100 || item.val == 200 || item.val == 500;
    });
  } else {
    simSearchResults = simMemoryPool.filter(item => {
      if (type === 'Dword') return item.type === 'Dword' && String(item.val) === queryVal;
      if (type === 'Float') return item.type === 'Float' && Math.abs(parseFloat(item.val) - parseFloat(queryVal)) < 0.5;
      return String(item.val) === queryVal;
    });
  }

  isFirstSearchDone = true;
  document.getElementById('sim-btn-refine').disabled = false;
  document.getElementById('sim-btn-edit-all').disabled = simSearchResults.length === 0;
  document.getElementById('sim-result-status').innerText = `搜尋完成！共找到 ${simSearchResults.length} 個匹配位址`;
  
  renderSimTable(simSearchResults);
}

function executeRefineSearch() {
  const queryVal = document.getElementById('sim-search-val').value.trim();
  if (!queryVal) return;

  simSearchResults = simSearchResults.filter(item => String(item.val) === queryVal);

  document.getElementById('sim-result-status').innerText = `再次過濾完成！剩餘 ${simSearchResults.length} 個位址`;
  document.getElementById('sim-btn-edit-all').disabled = simSearchResults.length === 0;
  renderSimTable(simSearchResults);
}

function executeBatchEdit() {
  const newVal = document.getElementById('sim-edit-all-val').value.trim();
  if (!newVal) {
    alert('請輸入欲批量修改的數值！');
    return;
  }

  simSearchResults.forEach(item => {
    item.val = newVal;
    item.modified = true;
  });

  document.getElementById('sim-result-status').innerText = `修改成功！已將 ${simSearchResults.length} 個位址數值批量更新為 ${newVal}`;
  renderSimTable(simSearchResults);
}

function renderSimTable(results) {
  const tbody = document.getElementById('sim-table-body');
  if (!tbody) return;

  if (results.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-msg">
          ${isFirstSearchDone ? '未搜尋到符合條件的記憶體位址' : '請點擊上方「新搜尋」開始模擬搜尋流程...'}
        </td>
      </tr>
    `;
    return;
  }

  const displayList = results.slice(0, 30);
  tbody.innerHTML = displayList.map(item => `
    <tr>
      <td class="addr-code">${item.addr}</td>
      <td><span class="sub-node-badge">${item.type}</span></td>
      <td class="${item.modified ? 'val-changed' : ''}">${item.val}</td>
      <td>${item.region}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editSingleSimAddr('${item.addr}')" style="padding: 2px 8px; font-size: 0.75rem;">
          <i class="fa-solid fa-pen"></i> 修改
        </button>
      </td>
    </tr>
  `).join('');
}

window.editSingleSimAddr = function(addr) {
  const target = simSearchResults.find(x => x.addr === addr);
  if (!target) return;
  const newVal = prompt(`請輸入位址 ${addr} 的新數值:`, target.val);
  if (newVal !== null && newVal !== '') {
    target.val = newVal;
    target.modified = true;
    renderSimTable(simSearchResults);
  }
};

/* ==========================================================================
   3. Interactive Speed Hack Physics Simulator (CPU Optimized via IntersectionObserver)
   ========================================================================== */

let speedMultiplier = 1.0;
let gameTimeSeconds = 0;
let lastFrameTime = performance.now();
let ballX = 50;
let ballSpeedX = 120;
let isSpeedHackSectionVisible = false;
let animationFrameId = null;

function initSpeedHackSimulator() {
  const slider = document.getElementById('speed-slider');
  const speedText = document.getElementById('speed-multiplier-text');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const jumpBtn = document.getElementById('btn-time-jump');
  const speedSection = document.getElementById('speedhack-section');

  slider?.addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value);
    if (speedText) speedText.innerText = speedMultiplier.toFixed(1) + 'x';
    updatePresetActiveState(speedMultiplier);
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const spd = parseFloat(btn.dataset.speed);
      speedMultiplier = spd;
      if (slider) slider.value = spd;
      if (speedText) speedText.innerText = spd.toFixed(1) + 'x';
      updatePresetActiveState(spd);
    });
  });

  jumpBtn?.addEventListener('click', () => {
    const sec = parseInt(document.getElementById('jump-seconds').value) || 3600;
    gameTimeSeconds += sec;
    alert(`⚡ 時間已成功向前跳躍 ${sec} 秒 (${(sec/3600).toFixed(1)} 小時)！`);
  });

  // IntersectionObserver to ONLY run animation loop when section is visible in viewport!
  // Saves 95%+ background CPU consumption.
  if ('IntersectionObserver' in window && speedSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isSpeedHackSectionVisible) {
            isSpeedHackSectionVisible = true;
            lastFrameTime = performance.now();
            animationFrameId = requestAnimationFrame(gameSimLoop);
          }
        } else {
          isSpeedHackSectionVisible = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(speedSection);
  } else {
    // Fallback if IntersectionObserver not supported
    isSpeedHackSectionVisible = true;
    requestAnimationFrame(gameSimLoop);
  }
}

function updatePresetActiveState(spd) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.speed) - spd) < 0.05);
  });
}

function gameSimLoop(now) {
  if (!isSpeedHackSectionVisible) return;

  const dt = Math.min((now - lastFrameTime) / 1000, 0.1); // Cap dt to prevent jump on tab switch
  lastFrameTime = now;

  const scaledDt = dt * speedMultiplier;
  gameTimeSeconds += scaledDt;

  const canvas = document.getElementById('game-sim-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ballX += ballSpeedX * scaledDt;
    if (ballX > width - 25 || ballX < 25) {
      ballSpeedX = -ballSpeedX;
    }

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Ball render (Optimized shadowBlur for performance)
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f2fe';
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(ballX, height / 2, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0; // Reset shadow for CPU performance
  }

  const clockElem = document.getElementById('game-time-clock');
  if (clockElem) {
    const hrs = Math.floor(gameTimeSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((gameTimeSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(gameTimeSeconds % 60).toString().padStart(2, '0');
    clockElem.innerText = `${hrs}:${mins}:${secs}`;
  }

  const fpsElem = document.getElementById('game-fps-counter');
  if (fpsElem && dt > 0) {
    fpsElem.innerText = Math.round(1 / dt);
  }

  animationFrameId = requestAnimationFrame(gameSimLoop);
}

/* ==========================================================================
   4. Memory Regions Map Component
   ========================================================================== */

const MEMORY_RANGES_DATA = [
  {
    code: 'Anonymous (A)',
    name: '匿名記憶體區塊',
    color: '#00f2fe',
    perm: 'Read / Write (rw-p)',
    speed: '最速 (推薦必勾)',
    recommend: '推薦：金幣、血量、角色屬性、Unity/Unreal 動態物件',
    desc: 'Anonymous 是 C/C++ 動態分配 (malloc) 最核心的記憶體區段。包含 Unity 引擎 Mono 堆疊與 Unreal Engine 物件屬性。90% 以上遊戲修改標的均位於此區域。'
  },
  {
    code: 'Code app (Xa)',
    name: '應用程式碼段',
    color: '#ff0055',
    perm: 'Read / Execute (r-xp)',
    speed: '特徵碼搜尋專用',
    recommend: '推薦：修補程式碼、無敵、無限子彈、鎖定技能CD',
    desc: '存放原生 .so 檔案 (`libil2cpp.so`, `libmain.so`) 的機器碼指令庫。在此區段搜尋與修改 ARM64 彙編指令，可從根源修改遊戲邏輯。'
  },
  {
    code: 'Java Heap (Jh)',
    name: 'Java 堆疊區',
    color: '#9d4edd',
    perm: 'Read / Write (rw-p)',
    speed: '快',
    recommend: '推薦：原生 Android Java 遊戲變數',
    desc: '由 Android Dalvik/ART 虛擬機器維護的對象記憶體。適用於以 Java/Kotlin 開發的原生遊戲與應用程式。'
  },
  {
    code: 'C_alloc (Ca)',
    name: 'C 堆疊分配區',
    color: '#00ff88',
    perm: 'Read / Write (rw-p)',
    speed: '快',
    recommend: '推薦：C 底層全域結構與動態緩衝區',
    desc: '由 C 標準庫內部分配的記憶體快取區域，常包含未封裝的結構體與常數陣列。'
  },
  {
    code: 'C_heap (Ch)',
    name: 'C 堆堆疊',
    color: '#ffb703',
    perm: 'Read / Write (rw-p)',
    speed: '中等',
    recommend: '推薦：C++ 常規 heap 變數',
    desc: '特定 Android 系統分配給 Native 層 C++ 引擎的常規堆記憶體區段。'
  },
  {
    code: 'C_data (Cd)',
    name: 'C 資料段',
    color: '#4facfe',
    perm: 'Read / Write (rw-p)',
    speed: '極速',
    recommend: '推薦：C++ 全局變數與靜態變數',
    desc: '存放已經初始化的全域變數 (Global Variables) 與靜態成員 (Static Members)。'
  },
  {
    code: 'Stack (S)',
    name: '系統線程堆疊',
    color: '#e0aaff',
    perm: 'Read / Write (rw-p)',
    speed: '中等',
    recommend: '推薦：局部臨時變數',
    desc: '線程運行時的臨時函數區域與局部變數。數值生命週期短，一般不建議長期鎖定。'
  },
  {
    code: 'Bad (Bb)',
    name: '危險/保護區塊',
    color: '#8a99b5',
    perm: 'No Access / Mixed',
    speed: '極慢 (預設取消)',
    recommend: '不推薦 (除非特種逆向)',
    desc: '包含系統只讀記憶體與損壞保護區段。勾選搜尋會大幅拉長搜尋時間且容易造成遊戲崩潰閃退。'
  }
];

function initMemoryMap() {
  const grid = document.getElementById('memory-map-grid');
  if (!grid) return;

  grid.innerHTML = MEMORY_RANGES_DATA.map((item, idx) => `
    <div class="mem-region-card ${idx === 0 ? 'active' : ''}" 
         style="--region-color: ${item.color}" 
         onclick="selectMemoryRegion(${idx})">
      <div class="mem-region-code">${item.code}</div>
      <div class="mem-region-name">${item.name}</div>
      <div class="mem-region-flag">${item.perm}</div>
    </div>
  `).join('');

  selectMemoryRegion(0);
}

window.selectMemoryRegion = function(index) {
  const item = MEMORY_RANGES_DATA[index];
  if (!item) return;

  document.querySelectorAll('.mem-region-card').forEach((card, idx) => {
    card.classList.toggle('active', idx === index);
  });

  document.getElementById('mem-detail-code').innerText = item.code;
  document.getElementById('mem-detail-code').style.color = item.color;
  document.getElementById('mem-detail-recommend').innerText = item.recommend;
  document.getElementById('mem-detail-desc').innerText = item.desc;
  document.getElementById('mem-detail-perm').innerText = item.perm;
  document.getElementById('mem-detail-speed').innerText = item.speed;
};

/* ==========================================================================
   5. Lua Scripting Workshop Component
   ========================================================================== */

const LUA_TEMPLATES = {
  'basic-search': `-- GameGuardian 基礎數值自動化搜尋與批量修改腳本
gg.clearResults()
gg.setRanges(gg.REGION_ANONYMOUS)

-- 1. 搜尋數值 1000 (Dword 類型)
gg.searchNumber("1000", gg.TYPE_DWORD, false, gg.SIGN_EQUAL, 0, -1)

local count = gg.getResultCount()
if count > 0 then
    local results = gg.getResults(count)
    -- 2. 一鍵修改所有結果為 999999
    gg.editAll("999999", gg.TYPE_DWORD)
    gg.toast("🎉 修改成功！共修改了 " .. count .. " 個記憶體位址")
else
    gg.alert("❌ 未找到指定的金幣數值！請確認是否已點開金幣頁面。")
end`,

  'group-search': `-- 聯合搜尋 Group Search 自動腳本
gg.clearResults()
gg.setRanges(gg.REGION_ANONYMOUS)

-- 搜尋相距 16 Byte 以內的數值組: 100 (血量) ; 200 (攻擊) ; 500 (防禦)
gg.searchNumber("100;200;500::16", gg.TYPE_DWORD, false, gg.SIGN_EQUAL, 0, -1)
gg.refineNumber("200", gg.TYPE_DWORD)

local results = gg.getResults(10)
if #results > 0 then
    gg.editAll("999999", gg.TYPE_DWORD)
    gg.toast("⚡ 攻擊力屬性鎖定完成！")
end`,

  'custom-menu': `-- 專業外掛彈出式 UI 選單 (gg.choice)
function MainMenu()
    local menu = gg.choice({
        "1. 💎 修改金幣為 999,999",
        "2. 🛡️ 開啟無限血量 (鎖定)",
        "3. ⚡ 遊戲 3.0x 加速",
        "4. 🚪 退出腳本"
    }, nil, "🔥 GameGuardian Pro Master 選單")

    if menu == 1 then EditGold() end
    if menu == 2 then FreezeHP() end
    if menu == 3 then gg.setSpeed(3.0) end
    if menu == 4 then os.exit() end
end

function EditGold()
    gg.clearResults()
    gg.searchNumber("1000", gg.TYPE_DWORD)
    gg.editAll("999999", gg.TYPE_DWORD)
    gg.toast("金幣修改成功")
end

function FreezeHP()
    gg.toast("血量凍結成功")
end

while true do
    if gg.isVisible(true) then
        gg.setVisible(false)
        MainMenu()
    end
    gg.sleep(100)
end`,

  'pointer-freeze': `-- 後台記憶體即時鎖定 (Freeze Loop)
local item = {}
item[1] = {
    address = 0x7b4a2c10,
    flags = gg.TYPE_DWORD,
    value = "999999",
    freeze = true
}

gg.addListItems(item)
gg.toast("🔒 已將數值加入後台守護清單並啟動凍結鎖定！")`,

  'bypass-wrapper': `-- Anti-Detection Protection Wrapper
gg.setVisible(false)
gg.clearResults()
gg.setRanges(gg.REGION_ANONYMOUS)

-- 清理反作弊偵測線程與記憶體痕跡
gg.toast("🛡️ 正在執行進程防護隱藏與特徵清理...")
gg.sleep(500)
gg.toast("✅ 防護準備就緒，可安全執行修改")`
};

function initLuaWorkshop() {
  const btns = document.querySelectorAll('.lua-tmpl-btn');
  const codeDisplay = document.getElementById('lua-code-display');
  const copyBtn = document.getElementById('copy-lua-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tmplKey = btn.dataset.tmpl;
      if (codeDisplay && LUA_TEMPLATES[tmplKey]) {
        codeDisplay.innerText = LUA_TEMPLATES[tmplKey];
      }
    });
  });

  copyBtn?.addEventListener('click', () => {
    if (!codeDisplay) return;
    navigator.clipboard.writeText(codeDisplay.innerText).then(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已複製程式碼！';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 複製腳本程式碼';
      }, 2000);
    });
  });
}

/* ==========================================================================
   6. Global Search & Category Filtering Engine
   ========================================================================== */

function initGlobalSearchAndFilter() {
  const searchInput = document.getElementById('global-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim().toLowerCase();
    performGlobalSearch(query);
  }, 150));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      filterBranchesByCategory(cat);
    });
  });
}

function filterBranchesByCategory(category) {
  const cards = document.querySelectorAll('.main-branch-card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
      card.classList.remove('collapsed');
    } else {
      card.style.display = 'none';
    }
  });

  requestAnimationFrame(() => setTimeout(drawTreeConnections, 100));
}

function performGlobalSearch(query) {
  const subNodes = document.querySelectorAll('.sub-node-item');
  const branchCards = document.querySelectorAll('.main-branch-card');

  if (!query) {
    subNodes.forEach(node => node.classList.remove('highlighted'));
    branchCards.forEach(card => card.style.display = 'block');
    requestAnimationFrame(() => setTimeout(drawTreeConnections, 100));
    return;
  }

  BRANCH_DATA.forEach(branch => {
    const card = document.getElementById(branch.id);
    let branchHasMatch = false;

    branch.subNodes.forEach(node => {
      const nodeElem = document.getElementById(node.id);
      const isMatch = node.title.toLowerCase().includes(query) ||
                      node.concept.toLowerCase().includes(query) ||
                      node.badge.toLowerCase().includes(query);

      if (nodeElem) {
        nodeElem.classList.toggle('highlighted', isMatch);
      }

      if (isMatch) branchHasMatch = true;
    });

    if (card) {
      if (branchHasMatch) {
        card.style.display = 'block';
        card.classList.remove('collapsed');
      } else {
        card.style.display = 'none';
      }
    }
  });

  requestAnimationFrame(() => setTimeout(drawTreeConnections, 100));
}

/* ==========================================================================
   7. Feature Breakdown Modal Engine
   ========================================================================== */

function initModalEvents() {
  const modal = document.getElementById('feature-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });
}

window.openFeatureModal = function(branchId, nodeId) {
  const branch = BRANCH_DATA.find(b => b.id === branchId);
  if (!branch) return;
  const node = branch.subNodes.find(n => n.id === nodeId);
  if (!node) return;

  const modal = document.getElementById('feature-modal');
  if (!modal) return;

  document.getElementById('modal-category').innerText = branch.name.toUpperCase();
  document.getElementById('modal-title').innerText = node.title;
  document.getElementById('modal-concept').innerText = node.concept;
  document.getElementById('modal-tip-text').innerText = node.tip;

  const iconElem = document.getElementById('modal-icon');
  if (iconElem) iconElem.innerHTML = `<i class="fa-solid ${branch.icon}"></i>`;

  const stepsElem = document.getElementById('modal-steps');
  if (stepsElem) {
    stepsElem.innerHTML = node.steps.map(step => `<li>${formatStepText(step)}</li>`).join('');
  }

  const codeBlock = document.getElementById('modal-code-block');
  const codeSec = document.getElementById('modal-code-sec');
  if (node.code) {
    if (codeSec) codeSec.style.display = 'block';
    if (codeBlock) codeBlock.innerText = node.code;
  } else {
    if (codeSec) codeSec.style.display = 'none';
  }

  modal.classList.add('active');
};

function closeModal() {
  document.getElementById('feature-modal')?.classList.remove('active');
}

function formatStepText(text) {
  return text.replace(/`([^`]+)`/g, '<code style="color:var(--primary); font-family:var(--font-code);">$1</code>');
}

// Utility: Throttle & Debounce
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
