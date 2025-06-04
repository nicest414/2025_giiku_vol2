import React from 'react';

/**
 * アプリケーションヘッダーコンポーネント
 */
export const AppHeader = ({ userStats, interventionData, interventionLevel }) => {
  return (
    <header className="app-header">
      <h1>🛒 Amazonカート分析結果</h1>
      <p className="subtitle">
        メスガキAIがあなたの買い物をチェック中... 💕
        {interventionLevel >= 3 && <span className="warning-text"> ⚠️ 警戒レベル上昇中</span>}
        {interventionLevel >= 4 && <span className="emergency-text"> 🚨 緊急事態</span>}
      </p>
      
      {/* 📢 介入メッセージ表示 */}
      {interventionData && (
        <div className={`intervention-message level-${interventionLevel}`}>
          <div className="intervention-icon">{interventionData.level.icon}</div>
          <div className="intervention-content">
            <h3>{interventionData.level.name}</h3>
            <p className="primary-message">{interventionData.primaryMessage}</p>
            {interventionData.psychologicalPressure && (
              <p className="psychological-pressure">{interventionData.psychologicalPressure.message}</p>
            )}
          </div>
        </div>
      )}
      
      {/* シンプルなレベル表示（ヘッダー用） */}
      {userStats && (
        <div className="header-level-display">
          <span className="level-badge">Lv.{userStats.level}</span>
          <span className="level-title">{userStats.title}</span>
        </div>
      )}
    </header>
  );
};