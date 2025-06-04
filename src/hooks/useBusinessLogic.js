import { useAIAnalysis } from './business/useAIAnalysis';
import { useIntervention } from './business/useIntervention';
import { usePurchaseDecision } from './business/usePurchaseDecision';
import { useReporting } from './business/useReporting';

/**
 * ビジネスロジック統合フック（リファクタリング版）
 * 各業務領域のフックを組み合わせて、統一されたインターフェースを提供
 */
export const useBusinessLogic = ({
  setAiResponses,
  setIsAiLoading,
  setHasAiError,
  setInterventionData,
  setInterventionLevel,
  setShowDecisionButtons,
  setUserDecision,
  handleLevelUp,
  startTimer
}) => {

  // AI分析関連
  const aiAnalysis = useAIAnalysis({
    setAiResponses,
    setIsAiLoading,
    setHasAiError,
    setInterventionData,
    setInterventionLevel,
    startTimer
  });

  // 介入システム関連
  const intervention = useIntervention({
    setInterventionLevel
  });

  // 購入決断関連
  const purchaseDecision = usePurchaseDecision({
    setUserDecision,
    setShowDecisionButtons,
    handleLevelUp
  });

  // レポート関連
  const reporting = useReporting();

  // 統合されたインターフェースを返す
  return {
    // AI分析
    analyzeCartWithAI: aiAnalysis.analyzeCartWithAI,
    
    // 介入システム
    handleSuspiciousBehavior: intervention.handleSuspiciousBehavior,
    handlePurchaseIgnored: intervention.handlePurchaseIgnored,
    handleProceedToCart: intervention.handleProceedToCart,
    getInterventionStats: intervention.getInterventionStats,
    
    // 購入決断
    handleBuyDecision: purchaseDecision.handleBuyDecision,
    handleResistDecision: purchaseDecision.handleResistDecision,
    
    // レポート
    handleShowMonthlyReport: reporting.handleShowMonthlyReport,
    getStats: reporting.getStats,
    generateDashboardData: reporting.generateDashboardData
  };
};