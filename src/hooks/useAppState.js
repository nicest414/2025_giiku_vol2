import { useState, useEffect } from 'react';
import { levelService } from '../services/levelService';
import { interventionService } from '../services/interventionService';

/**
 * アプリケーション全体の状態管理フック
 */
export const useAppState = () => {
  // レベルシステム状態管理
  const [userStats, setUserStats] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({});

  // サイドバー状態管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI分析の状態管理
  const [aiResponses, setAiResponses] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasAiError, setHasAiError] = useState(false);

  // 📢 介入システム状態管理
  const [interventionData, setInterventionData] = useState(null);
  const [interventionLevel, setInterventionLevel] = useState(1);

  // 🛒 購入判断システム状態管理
  const [showDecisionButtons, setShowDecisionButtons] = useState(false);
  const [userDecision, setUserDecision] = useState(null); // 'buy' | 'resist' | null

  // レベルシステム初期化
  useEffect(() => {
    const stats = levelService.getUserStats();
    setUserStats(stats);
    
    // 📢 介入システム初期化
    const currentLevel = interventionService.calculateResistanceLevel();
    setInterventionLevel(currentLevel);
    
    // 🕵️ 怪しい行動検知: ページ訪問
    interventionService.detectSuspiciousBehavior('repeatVisits');
    
    console.log('👤 ユーザーレベル読み込み:', stats);
    console.log('📢 現在の介入レベル:', currentLevel);
  }, []);

  /**
   * レベルアップ処理
   */
  const handleLevelUp = (result) => {
    if (result.leveledUp) {
      setLevelUpData({
        newLevel: result.newLevel,
        newTitle: levelService.getLevelTitle(result.newLevel),
        expGained: result.addedExp
      });
      setShowLevelUp(true);
    }
    setUserStats(levelService.getUserStats());
  };

  return {
    // レベルシステム
    userStats,
    setUserStats,
    showLevelUp,
    setShowLevelUp,
    levelUpData,
    setLevelUpData,
    handleLevelUp,

    // サイドバー
    isSidebarOpen,
    setIsSidebarOpen,

    // AI分析
    aiResponses,
    setAiResponses,
    isAiLoading,
    setIsAiLoading,
    hasAiError,
    setHasAiError,

    // 介入システム
    interventionData,
    setInterventionData,
    interventionLevel,
    setInterventionLevel,

    // 購入判断
    showDecisionButtons,
    setShowDecisionButtons,
    userDecision,
    setUserDecision
  };
};