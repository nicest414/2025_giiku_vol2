import React from 'react';

/**
 * 商品情報表示コンポーネント
 * 商品画像、タイトル、価格を表示
 * @param {Object} item - 商品データ
 */
export const ProductInfo = ({ item }) => {
  if (!item) {
    return (
      <div className="product-info">
        <div className="product-placeholder">
          商品情報を読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="product-info">
      <h3 className="product-title">{item.title}</h3>
      <p className="product-price">{item.price}</p>
      <p className="product-description">{item.description || '商品の詳細情報'}</p>
    </div>
  );
};

/**
 * キャラクター表示とメッセージ吹き出しコンポーネント
 * メスガキキャラクターの画像と毒舌メッセージを表示
 * @param {string} message - AIからの毒舌メッセージ
 * @param {boolean} isLoading - メッセージ生成中フラグ
 */
export const CharacterSection = ({ message, isLoading = false }) => {
  // プロキシ経由でCORS問題を回避 or ローカル画像を使用
  const characterImageUrl = "/logo192.png"; // 一時的にローカル画像を使用

  return (
    <div className="character-section">
      <div className="speech-bubble">
        <p className={`message-text ${isLoading ? 'loading' : ''}`}>
          {isLoading ? "考え中..." : message || "考え中……"}
        </p>
      </div>
      <div className="character-container">
        <img 
          src={characterImageUrl}
          alt="メスガキキャラクター" 
          className="character-image"
          onError={(e) => {
            e.target.style.display = 'none'; // 画像読み込み失敗時は非表示
          }}
        />
      </div>
    </div>
  );
};

/**
 * 商品とAIメッセージの組み合わせ表示コンポーネント
 * ProductInfoとCharacterSectionを組み合わせて表示
 * @param {Object} item - 商品データ
 * @param {string} message - AIメッセージ
 * @param {boolean} isLoading - ローディング状態
 */
export const ProductCard = ({ item, message, isLoading = false }) => {
  return (
    <div className="product-card">
      <div className="product-content">
        <img 
          src={item?.imageUrl || '/placeholder-image.png'} 
          alt={item?.title || '商品画像'}
          className="product-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23f8f9fa"/%3E%3Ctext x="75" y="75" text-anchor="middle" dy=".3em" fill="%23adb5bd"%3E画像なし%3C/text%3E%3C/svg%3E';
          }}
          loading="lazy"
        />
        <ProductInfo item={item} />
      </div>
      <CharacterSection message={message} isLoading={isLoading} />
    </div>
  );
};