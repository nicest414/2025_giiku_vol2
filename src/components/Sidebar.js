import React, { useState } from 'react';
import { UserLevelDisplay, AchievementDisplay, PurchaseHistoryDisplay } from './index';

/**
 * サイドバーコンポーネント
 * レベル情報、実績、購入履歴を表示
 */
export const Sidebar = ({ userStats, isOpen, onToggle, onShowMonthlyReport, interventionStats }) => {
  const [activeTab, setActiveTab] = useState('level'); // 'level' | 'achievements' | 'history' | 'intervention'

  if (!userStats) return null;

  /**
   * タブ切り替え処理
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* サイドバー切り替えボタン */}
      <button className={`sidebar-toggle ${isOpen ? 'open' : ''}`} onClick={onToggle}>
        <span className="toggle-icon">
          {isOpen ? '◀' : '▶'}
        </span>
        <span className="toggle-text">
          {isOpen ? 'データを隠す' : 'データを表示'}
        </span>
      </button>

      {/* サイドバー本体 */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>📊 ユーザーデータ</h2>
            {/* タブナビゲーション */}
          <div className="sidebar-tabs">
            <button 
              className={`tab-button ${activeTab === 'level' ? 'active' : ''}`}
              onClick={() => handleTabChange('level')}
            >
              📈 レベル
            </button>
            <button 
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => handleTabChange('achievements')}
            >
              🏆 実績
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              📋 履歴
            </button>
            <button 
              className={`tab-button ${activeTab === 'intervention' ? 'active' : ''}`}
              onClick={() => handleTabChange('intervention')}
            >
              📢 介入
            </button>
          </div>
          
          {/* 📊 月次レポートボタン */}
          {onShowMonthlyReport && (
            <div className="sidebar-actions">
              <button 
                className="monthly-report-button"
                onClick={onShowMonthlyReport}
              >
                📊 月次レポート表示
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          {/* レベルタブ */}
          {activeTab === 'level' && (
            <div className="sidebar-section">
              <UserLevelDisplay userStats={userStats} showDetails={true} />
            </div>
          )}

          {/* 実績タブ */}
          {activeTab === 'achievements' && (
            <div className="sidebar-section">
              <AchievementDisplay achievements={userStats.achievements} />
            </div>
          )}          {/* 履歴タブ */}
          {activeTab === 'history' && (
            <div className="sidebar-section">
              <PurchaseHistoryDisplay />
            </div>
          )}

          {/* 📢 介入統計タブ */}
          {activeTab === 'intervention' && interventionStats && (
            <div className="sidebar-section">
              <h3>📢 介入システム統計</h3>
              <div className="intervention-stats">
                <div className="stat-item">
                  <span className="stat-label">総介入回数:</span>
                  <span className="stat-value">{interventionStats.totalInterventions}回</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">成功率:</span>
                  <span className="stat-value success-rate">{interventionStats.successRate}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">現在の抵抗レベル:</span>
                  <span className={`stat-value resistance-level-${interventionStats.currentResistanceLevel}`}>
                    Lv.{interventionStats.currentResistanceLevel}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">連続無視回数:</span>
                  <span className={`stat-value ${interventionStats.consecutiveIgnores > 2 ? 'warning' : ''}`}>
                    {interventionStats.consecutiveIgnores}回
                  </span>
                </div>
              </div>
              
              {/* 行動パターン分析 */}
              <div className="behavior-pattern">
                <h4>🕵️ 行動パターン分析</h4>
                <div className="pattern-list">
                  <div className="pattern-item">
                    <span>連続クリック: {interventionStats.behaviorPattern?.rapidClicking || 0}回</span>
                  </div>
                  <div className="pattern-item">
                    <span>深夜買い物: {interventionStats.behaviorPattern?.lateNightShopping || 0}回</span>
                  </div>
                  <div className="pattern-item">
                    <span>商品往復: {interventionStats.behaviorPattern?.repeatVisits || 0}回</span>
                  </div>
                  <div className="pattern-item">
                    <span>価格ジャンプ: {interventionStats.behaviorPattern?.priceJumping || 0}回</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* サイドバーフッター */}
        <div className="sidebar-footer">
          <div className="user-summary">
            <div className="summary-item">
              <span className="summary-label">Lv.</span>
              <span className="summary-value">{userStats.level}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">節約額</span>
              <span className="summary-value">¥{userStats.totalSaved.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">実績</span>
              <span className="summary-value">{userStats.achievementCount}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* サイドバーが開いている時のオーバーレイ（モバイル用） */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
    </>
  );
};
