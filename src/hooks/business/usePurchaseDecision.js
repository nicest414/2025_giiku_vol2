import { useCallback } from 'react';
import { levelService } from '../../services/levelService';
import { purchaseHistoryService } from '../../services/purchaseHistoryService';
import { interventionService } from '../../services/interventionService';

/**
 * 購入決断関連のビジネスロジック
 */
export const usePurchaseDecision = ({
  setUserDecision,
  setShowDecisionButtons,
  handleLevelUp
}) => {
  /**
   * 🛒 「買う」ボタンクリック時の処理
   */
  const handleBuyDecision = useCallback((cartItems) => {
    setUserDecision('buy');
    setShowDecisionButtons(false);
    
    // 📢 介入失敗として記録
    interventionService.onInterventionFailure();
    
    console.log('🛒 ユーザーが購入を選択しました');
    
    // 購入履歴として記録（購入成功）
    const totalAmount = cartItems.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
      return sum + priceNum;
    }, 0);
    
    purchaseHistoryService.recordPurchase(cartItems, totalAmount);
    
    // Amazonカートページに戻る
    setTimeout(() => {
      window.location.href = "https://www.amazon.co.jp/gp/cart/view.html?ref_=nav_cart";
    }, 2000);
  }, [setUserDecision, setShowDecisionButtons]);

  /**
   * 🛡️ 「買わない」ボタンクリック時の処理
   */
  const handleResistDecision = useCallback((cartItems, aiResponses) => {
    setUserDecision('resist');
    setShowDecisionButtons(false);
    
    // 📊 購入阻止の記録を保存
    const totalAmount = cartItems.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
      return sum + priceNum;
    }, 0);
    
    purchaseHistoryService.recordBlocked(cartItems, aiResponses, totalAmount);
    
    // 📢 介入成功として記録
    interventionService.onInterventionSuccess();
    
    // 🎮 レベルシステム: 踏みとどまり成功経験値
    const result = levelService.onPurchaseBlocked(totalAmount);
    handleLevelUp(result);
    
    console.log('🛡️ ユーザーが踏みとどまりました！', {
      items: cartItems.length,
      amount: totalAmount,
      level: result
    });
  }, [setUserDecision, setShowDecisionButtons, handleLevelUp]);

  return {
    handleBuyDecision,
    handleResistDecision
  };
};