import { useCallback } from 'react';
import { levelService } from '../../services/levelService';
import { interventionService } from '../../services/interventionService';

/**
 * レポート・統計関連のビジネスロジック
 */
export const useReporting = () => {
  /**
   * 📊 月次レポートを生成・表示
   */
  const handleShowMonthlyReport = useCallback(() => {
    const monthlyReport = levelService.generateMonthlyReport();
    const interventionStats = interventionService.getInterventionStats();
    
    console.log('📊 月次レポート:', monthlyReport);
    console.log('📢 介入統計:', interventionStats);
    
    const reportText = `
🎉 ${monthlyReport.month} 月次レポート 🎉

💰 節約金額: ¥${monthlyReport.totalSaved.toLocaleString()}
🛡️ 衝動買い阻止回数: ${monthlyReport.impulseBlockCount}回
⏰ タイマー完走回数: ${monthlyReport.timerCompletions}回
🌙 深夜阻止回数: ${monthlyReport.lateNightBlocks}回

📊 平均節約額/回: ¥${monthlyReport.averageSavedPerBlock.toLocaleString()}
⭐ メスガキ評価: ${monthlyReport.characterRating.stars}
💬 コメント: ${monthlyReport.characterRating.comment}

📈 介入成功率: ${interventionStats.successRate}%
🔥 現在の抵抗レベル: Lv.${interventionStats.currentResistanceLevel}

💡 改善提案:
${monthlyReport.improvementSuggestions.join('\n')}
    `;
    
    alert(reportText);
  }, []);

  /**
   * 📈 統計データを取得
   */
  const getStats = useCallback(() => {
    return {
      monthly: levelService.generateMonthlyReport(),
      intervention: interventionService.getInterventionStats(),
      level: levelService.getUserStats()
    };
  }, []);

  /**
   * 📊 ダッシュボードデータを生成
   */
  const generateDashboardData = useCallback(() => {
    const stats = getStats();
    
    return {
      totalSaved: stats.level.totalSaved,
      totalBlocked: stats.level.blockedCount,
      currentLevel: stats.level.level,
      currentTitle: stats.level.title,
      interventionSuccessRate: stats.intervention.successRate,
      monthlyData: stats.monthly,
      recentActivity: {
        lastBlockedAmount: stats.monthly.lastBlockedAmount || 0,
        streakDays: stats.monthly.streakDays || 0,
        weeklyProgress: stats.monthly.weeklyProgress || 0
      }
    };
  }, [getStats]);

  return {
    handleShowMonthlyReport,
    getStats,
    generateDashboardData
  };
};