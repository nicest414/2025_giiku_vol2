import React from 'react';

/**
 * 購入判断ボタンセクション
 */
export const DecisionButtonsSection = ({ show, onResist, onBuy }) => {
  if (!show) return null;

  return (
    <div className="decision-buttons-section">
      <div className="decision-message">
        <h3>🤔 最終決断の時間です</h3>
        <p>メスガキの助言を聞いて、どうしますか？</p>
      </div>
      <div className="decision-buttons">
        <button 
          className="decision-button resist-button"
          onClick={onResist}
        >
          <span className="button-icon">🛡️</span>
          <span className="button-text">踏みとどまる</span>
          <span className="button-subtitle">メスガキの勝利</span>
        </button>
        <button 
          className="decision-button buy-button"
          onClick={onBuy}
        >
          <span className="button-icon">🛒</span>
          <span className="button-text">それでも買う</span>
          <span className="button-subtitle">Amazon へGO💳</span>
        </button>
      </div>
    </div>
  );
};

/**
 * 決断結果表示セクション
 */
export const DecisionResultSection = ({ userDecision, cartItems }) => {
  if (!userDecision) return null;

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (parseInt(item.price.replace(/[¥,]/g, '')) || 0);
  }, 0);

  return (
    <div className="decision-result-section">
      {userDecision === 'resist' ? (
        <div className="resist-result">
          <h3>素晴らしい判断です！</h3>
          <p>メスガキの説得が効いたようですね</p>
          <p className="savings-message">
            ¥{totalAmount.toLocaleString()} の節約に成功！
          </p>
        </div>
      ) : (
        <div className="buy-result">
          <div className="result-icon">😤</div>
          <h3>まぁ...仕方ないかぁ～</h3>
          <p>わたしの負け...でも次は絶対止めてあげるからね！</p>
          <p className="redirect-message">
            2秒後にAmazonカートに戻ります...🛒
          </p>
        </div>
      )}
    </div>
  );
};