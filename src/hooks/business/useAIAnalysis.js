import { useCallback } from 'react';
import { aiService } from '../../services/aiService';
import { interventionService } from '../../services/interventionService';

/**
 * AI分析関連のビジネスロジック
 */
export const useAIAnalysis = ({
  setAiResponses,
  setIsAiLoading,
  setHasAiError,
  setInterventionData,
  setInterventionLevel,
  startTimer
}) => {
  /**
   * カート商品に対するAI分析を実行
   */
  const analyzeCartWithAI = useCallback(async (items) => {
    if (!items || items.length === 0) return;

    setIsAiLoading(true);
    setHasAiError(false);

    try {
      console.log(`${items.length}個の商品をAI分析開始`);
      
      // 📢 介入メッセージを生成
      const intervention = interventionService.generateInterventionMessage(items);
      setInterventionData(intervention);
      setInterventionLevel(intervention.level.level);
      
      console.log('📢 介入レベル:', intervention.level.name);
      console.log('💬 介入メッセージ:', intervention.primaryMessage);
      
      const responses = await aiService.analyzeCartItems(items);
      setAiResponses(responses);
      
      // AI分析完了後にタイマー開始
      startTimer();
    } catch (error) {
      console.error("AI分析エラー:", error);
      setHasAiError(true);
      
      // 📢 エラー時も介入失敗として記録
      interventionService.onInterventionFailure();
    } finally {
      setIsAiLoading(false);
    }
  }, [setAiResponses, setIsAiLoading, setHasAiError, setInterventionData, setInterventionLevel, startTimer]);

  return {
    analyzeCartWithAI
  };
};