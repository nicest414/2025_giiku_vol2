import { useCallback } from 'react';
import { interventionService } from '../../services/interventionService';

/**
 * 介入システム関連のビジネスロジック
 */
export const useIntervention = ({
  setInterventionLevel
}) => {
  /**
   * 🕵️ 怪しい行動を検知して介入レベルを調整
   */
  const handleSuspiciousBehavior = useCallback((behaviorType) => {
    const suspiciousCount = interventionService.detectSuspiciousBehavior(behaviorType);
    
    if (suspiciousCount > 0) {
      const newLevel = interventionService.calculateResistanceLevel();
      setInterventionLevel(newLevel);
      
      console.log(`🕵️ 怪しい行動検知: ${behaviorType}, 新しい介入レベル: ${newLevel}`);
      
      if (behaviorType === 'lateNightShopping') {
        console.log('🌙 深夜の買い物を検知しました！');
      }
    }
  }, [setInterventionLevel]);

  /**
   * 🛒 購入ボタン無視時の処理
   */
  const handlePurchaseIgnored = useCallback(() => {
    interventionService.onInterventionFailure();
    const newLevel = interventionService.calculateResistanceLevel();
    setInterventionLevel(newLevel);
    
    console.log('購入ボタンが無視されました。介入失敗記録');
    console.log('新しい介入レベル:', newLevel);
  }, [setInterventionLevel]);

  /**
   * Amazonカートページに戻る処理
   */
  const handleProceedToCart = useCallback((interventionLevel) => {
    // 🕵️ 連続クリックを検知
    handleSuspiciousBehavior('rapidClicking');
    
    // 📢 ユーザーが介入を無視して購入に進んだ場合
    if (interventionLevel >= 2) {
      handlePurchaseIgnored();
      
      // 緊急レベルの場合は追加の確認
      if (interventionLevel >= 4) {
        const confirmPurchase = window.confirm(
          "🚨 緊急警告 🚨\n\n本当に購入しますか？\nメスガキが必死に止めようとしています😭\n\n確認してください："
        );
        
        if (!confirmPurchase) {
          console.log("📢 緊急レベルで購入を阻止成功");
          interventionService.onInterventionSuccess();
          return;
        }
      }
    }
    
    // 深夜買い物チェック
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      handleSuspiciousBehavior('lateNightShopping');
    }
    
    console.log("🛒 ユーザーがカートページに移動");
    window.location.href = "https://www.amazon.co.jp/gp/cart/view.html?ref_=nav_cart";
  }, [handleSuspiciousBehavior, handlePurchaseIgnored]);

  /**
   * 🎯 介入統計を取得
   */
  const getInterventionStats = useCallback(() => {
    return interventionService.getInterventionStats();
  }, []);

  return {
    handleSuspiciousBehavior,
    handlePurchaseIgnored,
    handleProceedToCart,
    getInterventionStats
  };
};