document.addEventListener("DOMContentLoaded", () => {
    // メスガキAI分析ボタン
    const analyzeButton = document.getElementById("analyzeCart");
    if (analyzeButton) {
        analyzeButton.addEventListener("click", () => {
            // カートデータを取得してReactアプリを開く
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentTab = tabs[0];
                
                // Amazonカートページかチェック
                if (currentTab.url.includes('amazon.co.jp') && currentTab.url.includes('cart')) {
                    // content.jsでカートデータを取得
                    chrome.scripting.executeScript({
                        target: { tabId: currentTab.id },
                        function: extractAndSaveCartData
                    }, () => {
                        // データ取得後、Reactアプリを開く
                        openMesugakiApp();
                    });
                } else {
                    alert("Amazonのカートページで実行してください！🛒");
                }
            });
        });
    }

    // 従来のテキスト出力ボタン（互換性のため残す）
    const getCartButton = document.getElementById("getCart");
    if (getCartButton) {
        getCartButton.addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: getCartItems
                });
            });
        });
    }
});

/**
 * カートデータを抽出してstorageに保存
 */
function extractAndSaveCartData() {
    let items = [];

    // カート内のアイテムを取得
    let cartItems = document.querySelectorAll(".sc-list-item-content");
    
    cartItems.forEach(item => {
        // 商品タイトルを取得
        let title = item.querySelector(".a-truncate-cut")?.innerText.trim() || "No Title";

        // 商品価格を取得
        let price = item.querySelector(".sc-item-price-block .a-offscreen")?.innerText.trim() || "No Price";

        // 商品画像URLを取得
        let imgElement = item.querySelector("img.sc-product-image");
        let imageUrl = imgElement ? imgElement.src : "No Image";

        // 商品情報を配列に保存
        items.push({
            title,
            price,
            imageUrl
        });

        console.log(`取得: ${title}, ${price}`);
    });

    // カート情報をstorageに保存
    if (items.length > 0) {
        chrome.storage.local.set({ amazonCartItems: items }, () => {
            console.log("🛒 カート情報を保存しました:", items);
            chrome.runtime.sendMessage({ type: "cart_saved", itemCount: items.length });
        });
    } else {
        console.log("❌ カートに商品がありません");
        chrome.runtime.sendMessage({ type: "cart_empty" });
    }

    return items.length;
}

/**
 * メスガキAIアプリを開く
 */
function openMesugakiApp() {
    // Reactアプリをテストモードで開く
    const reactAppUrl = chrome.runtime.getURL("build/index.html") + "?test=true";
    
    chrome.tabs.create({
        url: reactAppUrl
    }, (tab) => {
        console.log("🎭 メスガキAIアプリを開きました:", tab.id);
    });
}

/**
 * 従来のカートデータ取得（テキスト出力用）
 */
function getCartItems() {
    let items = [];
    document.querySelectorAll('.sc-list-item-content').forEach(item => {
        let title = item.querySelector('.a-truncate-cut')?.innerText.trim() || "No Title";
        let price = item.querySelector('.sc-item-price-block .a-offscreen')?.innerText.trim() || "No Price";
        items.push(`${title} - ${price}`);
    });

    if (items.length > 0) {
        let blob = new Blob([items.join("\n")], { type: "text/plain" });
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "amazon_cart.txt";
        a.click();
    } else {
        alert("カートが空です！");
    }
}