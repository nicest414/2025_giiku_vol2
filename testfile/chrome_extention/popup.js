document.addEventListener("DOMContentLoaded", () => {
    const openButton = document.getElementById("openReactApp");
    if (openButton) {
        openButton.addEventListener("click", () => {
            // 新しいタブでReactアプリを開く
            chrome.tabs.create({
                url: "chrome-extension://dncofkblhejiblbjjbgcfdamcpadekmh/build/index.html"  // 拡張機能IDを正しく設定
            });
        });
    }
});