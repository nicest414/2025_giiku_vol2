// background.js

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://www.amazon.co.jp/checkout/p/")
  ) {
    // 遷移先URLを取得
    const url = chrome.runtime.getURL("build/index.html");
    chrome.tabs.update(tabId, { url }, () => {
      console.log("同じタブ上でReactアプリを開きました");
    });
  }
});

