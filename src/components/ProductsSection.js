import React from 'react';
import { ProductCard, LoadingSpinner, DangerLevelIndicator } from './index';

/**
 * 商品一覧セクションコンポーネント
 */
export const ProductsSection = ({ 
  cartItems, 
  aiResponses, 
  isAiLoading 
}) => {
  return (
    <main className="app-main">
      {/* 危険度インジケーター */}
      <DangerLevelIndicator />

      {/* 商品リスト */}
      <div className="products-container">
        {cartItems.map((item, index) => (
          <ProductCard
            key={`${item.title}-${index}`}
            item={item}
            message={aiResponses[index]}
            isLoading={isAiLoading && !aiResponses[index]}
          />
        ))}
      </div>

      {/* AI分析中の表示 */}
      {isAiLoading && (
        <div className="ai-loading-section">
          <LoadingSpinner message="メスガキが毒舌準備中..." />
        </div>
      )}
    </main>
  );
};