import React, { useState } from 'react';
import { UserLevelDisplay, AchievementDisplay, PurchaseHistoryDisplay } from './index';

/**
 * サイドバーコンポーネント
 * レベル情報、実績、購入履歴を表示
 */
export const Sidebar = ({ userStats, isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState('level'); // 'level' | 'achievements' | 'history'

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
          </div>
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
          )}

          {/* 履歴タブ */}
          {activeTab === 'history' && (
            <div className="sidebar-section">
              <PurchaseHistoryDisplay />
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
