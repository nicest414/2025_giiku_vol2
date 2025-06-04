import React from 'react';

/**
 * ユーザーレベル表示コンポーネント
 * レベル、経験値、タイトルを表示
 * @param {Object} userStats - ユーザー統計データ
 * @param {boolean} showDetails - 詳細表示フラグ
 */
export const UserLevelDisplay = ({ userStats, showDetails = false }) => {
  if (!userStats) return null;

  const expProgress = userStats.expToNext > 0 
    ? ((userStats.exp % 1000) / 1000) * 100 
    : 100;

  return (
    <div className="user-level-display">
      <div className="level-header">
        <span className="level-badge">Lv.{userStats.level}</span>
        <span className="level-title">{userStats.title}</span>
      </div>
      
      {showDetails && (
        <div className="level-details">
          <div className="exp-bar-container">
            <div className="exp-bar">
              <div 
                className="exp-fill"
                style={{ width: `${expProgress}%` }}
              />
            </div>
            <span className="exp-text">
              EXP: {userStats.exp} 
              {userStats.expToNext > 0 && ` (次まで${userStats.expToNext})`}
            </span>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">💰 節約額</span>
              <span className="stat-value">¥{userStats.totalSaved.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🛡️ 阻止回数</span>
              <span className="stat-value">{userStats.blockedCount}回</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🏆 実績</span>
              <span className="stat-value">{userStats.achievementCount}個</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 実績表示コンポーネント
 * 獲得済み実績をアイコン付きで表示
 * @param {Object} achievements - 実績データ
 */
export const AchievementDisplay = ({ achievements }) => {
  const achievementList = Object.values(achievements || {});

  if (achievementList.length === 0) {
    return (
      <div className="achievement-display empty">
        <p>まだ実績がありません</p>
        <p>メスガキと戦って実績を解除しよう！💪</p>
      </div>
    );
  }

  return (
    <div className="achievement-display">
      <h3>🏆 獲得実績</h3>
      <div className="achievement-grid">
        {achievementList.map(achievement => (
          <div key={achievement.id} className="achievement-item">
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
              <small>
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * レベルアップ通知コンポーネント
 * レベルアップ時のお祝いアニメーション
 * @param {boolean} show - 表示フラグ
 * @param {number} newLevel - 新しいレベル
 * @param {string} newTitle - 新しいタイトル
 * @param {function} onClose - 閉じるコールバック
 */
export const LevelUpNotification = ({ show, newLevel, newTitle, onClose }) => {
  if (!show) return null;

  return (
    <div className="level-up-overlay">
      <div className="level-up-modal">
        <div className="level-up-animation">
          ✨🎉✨
        </div>
        <h2>レベルアップ！</h2>
        <div className="new-level">
          <span className="level-badge big">Lv.{newLevel}</span>
          <span className="new-title">{newTitle}</span>
        </div>
        <p>おめでとう〜！でもまだまだ無駄遣いしそうだけどね💕</p>
        <button onClick={onClose} className="level-up-close">
          続ける
        </button>
      </div>
    </div>
  );
};