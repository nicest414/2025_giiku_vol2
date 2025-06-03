// カートページのURL確認
let items = [];

// データ取得前に遅延を設定 (2秒)
setTimeout(() => {
    // 「sc-secondary-list」にアイテムが含まれているか確認
    let secondaryList = document.querySelector("#sc-active-items-header");
    if (secondaryList) {
        console.log("「sc-secondary-list」内のアイテムは除外します");
    }

    // カート内のアイテムを取得（「sc-secondary-list」に含まれていないものを除外）
    let cartItems = document.querySelectorAll(".sc-list-item-content");
    console.log(secondaryList);

    cartItems.forEach(item => {
        // 「sc-secondary-list」のアイテムを除外
        if (!secondaryList.contains(item)) {
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

            // デバッグ用：取得したタイトル、価格、画像URLを表示
            console.log(`タイトル: ${title}, 価格: ${price}, 画像URL: ${imageUrl}`);
        }
    });

    // カート情報があれば、chrome.storage.local に保存
    if (items.length > 0) {
        // 保存前にも遅延を追加 (2秒)
        setTimeout(() => {
            chrome.storage.local.set({ amazonCartItems: items }, () => {
                console.log("カート情報を保存しました");
                chrome.runtime.sendMessage({ type: "cart_saved" });
            });
        }, 2000); // 2秒の遅延
    } else {
        console.log("カートに商品がありません");
    }

}, 2000); // データ取得前の遅延（2秒）
