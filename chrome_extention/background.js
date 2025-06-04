// 🎭 メスガキAI Chrome拡張 バックグラウンドスクリプト

// 購入ページに移動時の自動介入
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://www.amazon.co.jp/checkout/p/")
  ) {
    // 遷移先URLを取得
    const url = chrome.runtime.getURL("build/index.html") + "?test=true";
    chrome.tabs.update(tabId, { url }, () => {
      console.log("🚨 購入ページを検知！メスガキAIで強制介入しました");
    });
  }
});

// ポップアップからのメッセージ処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 バックグラウンドでメッセージ受信:", message);
  
  switch (message.type) {
    case "cart_saved":
      console.log(`🛒 カートデータ保存完了: ${message.itemCount}件の商品`);
      // ここで必要に応じて追加処理
      break;
      
    case "cart_empty":
      console.log("❌ カートが空でした");
      break;
      
    case "intervention_success":
      console.log("🎉 メスガキAIの介入が成功しました！");
      break;
      
    case "intervention_failure":
      console.log("😤 ユーザーが介入を無視しました...");
      break;
      
    default:
      console.log("❓ 不明なメッセージタイプ:", message.type);
  }
  
  // レスポンスを送信（必要に応じて）
  sendResponse({ status: "received" });
});

