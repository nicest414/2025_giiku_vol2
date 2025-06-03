import React from 'react';

// 新しい購入履歴コンポーネントをインポート
export { PurchaseHistoryDisplay } from './PurchaseHistoryDisplay';

// サイドバーコンポーネントをインポート
export { Sidebar } from './Sidebar';

/**
 * 商品情報表示コンポーネント
 * 商品画像、タイトル、価格を表示
 * @param {Object} item - 商品データ
 */
export const ProductInfo = ({ item }) => {
  if (!item) {
    return (
      <div className="product-info">
        <div className="product-placeholder">
          商品情報を読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="product-info">
      <h3 className="product-title">{item.title}</h3>
      <p className="product-price">{item.price}</p>
      <p className="product-description">{item.description || '商品の詳細情報'}</p>
    </div>
  );
};

/**
 * キャラクター表示とメッセージ吹き出しコンポーネント
 * メスガキキャラクターの画像と毒舌メッセージを表示
 * @param {string} message - AIからの毒舌メッセージ
 * @param {boolean} isLoading - メッセージ生成中フラグ
 */
export const CharacterSection = ({ message, isLoading = false }) => {
  // プロキシ経由でCORS問題を回避 or ローカル画像を使用
  const characterImageUrl = "/logo192.png"; // 一時的にローカル画像を使用

  return (
    <div className="character-section">
      <div className="speech-bubble">
        <p className={`message-text ${isLoading ? 'loading' : ''}`}>
          {isLoading ? "考え中..." : message || "考え中……"}
        </p>
      </div>
      <div className="character-container">
        <img 
          src={characterImageUrl}
          alt="メスガキキャラクター" 
          className="character-image"
          onError={(e) => {
            e.target.style.display = 'none'; // 画像読み込み失敗時は非表示
          }}
        />
      </div>
    </div>
  );
};

/**
 * 商品とAIメッセージの組み合わせ表示コンポーネント
 * ProductInfoとCharacterSectionを組み合わせて表示
 * @param {Object} item - 商品データ
 * @param {string} message - AIメッセージ
 * @param {boolean} isLoading - ローディング状態
 */
export const ProductCard = ({ item, message, isLoading = false }) => {
  return (
    <div className="product-card">
      <div className="product-content">
        <img 
          src={item?.imageUrl || '/placeholder-image.png'} 
          alt={item?.title || '商品画像'}
          className="product-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23f8f9fa"/%3E%3Ctext x="75" y="75" text-anchor="middle" dy=".3em" fill="%23adb5bd"%3E画像なし%3C/text%3E%3C/svg%3E';
          }}
          loading="lazy"
        />
        <ProductInfo item={item} />
      </div>
      <CharacterSection message={message} isLoading={isLoading} />
    </div>
  );
};

/**
 * プログレスバーコンポーネント
 * カウントダウンタイマーの残り時間を視覚的に表示（残り時間の割合）
 * @param {number} progress - 残り時間の割合（0-100）
 */
export const ProgressBar = ({ progress }) => {
  // プログレスバーの幅を計算（0〜100の範囲で制限）
  const progressWidth = Math.min(100, Math.max(0, progress));
  
  // デバッグ用ログ - より詳細な情報を出力
  console.log('📊 ProgressBar render:', { 
    rawProgress: progress, 
    calculatedWidth: progressWidth,
    cssWidth: `${progressWidth}%`
  });
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${progressWidth}%`
            // backgroundColorは削除 - CSS側のグラデーションを使用
          }}
        />
      </div>
    </div>
  );
};

/**
 * タイマー表示コンポーネント
 * 残り時間とメッセージを表示
 * @param {number} timeLeft - 残り時間（秒）
 * @param {boolean} isCompleted - タイマー完了フラグ
 */
export const TimerDisplay = ({ timeLeft, isCompleted }) => {
  // デバッグ用ログ
  console.log('🕒 TimerDisplay render:', { timeLeft, isCompleted });
  
  return (
    <div className="timer-display">
      {isCompleted ? (
        <div className="timer-text timer-completed">
          ✨ 考える時間が終わりました ✨
        </div>
      ) : (
        <>
          <div className="timer-text">
            🕒 考える時間: {timeLeft}秒
          </div>
          <div className="timer-subtitle">
            衝動買いを防ぐため、少し待ってね〜 💖
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 進行ボタンコンポーネント
 * タイマー完了後にAmazonカートページへの遷移を提供
 * @param {boolean} isEnabled - ボタン有効化フラグ
 * @param {function} onClick - クリックハンドラ
 */
export const ProceedButton = ({ isEnabled, onClick }) => {
  const handleClick = () => {
    if (isEnabled && onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={`proceed-button ${isEnabled ? 'active' : 'disabled'}`}
      disabled={!isEnabled}
      onClick={handleClick}
    >
      {isEnabled ? 'カートに戻る' : '待機中...'}
    </button>
  );
};

/**
 * ローディング表示コンポーネント
 * データ取得中やAI分析中の状態を表示
 * @param {string} message - ローディングメッセージ
 */
export const LoadingSpinner = ({ message = "読み込み中..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

/**
 * エラー表示コンポーネント
 * エラー状態とリトライ機能を提供
 * @param {string} message - エラーメッセージ
 * @param {function} onRetry - リトライ関数
 */
export const ErrorDisplay = ({ message = "エラーが発生しました", onRetry }) => {
  return (
    <div className="error-container">
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          再試行
        </button>
      )}
    </div>
  );
};

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

/**
 * 時間帯危険度表示コンポーネント
 * 現在時刻の買い物危険度を表示
 */
export const DangerLevelIndicator = () => {
  const hour = new Date().getHours();
  
  let dangerLevel, message, className;
  
  if (hour >= 22 || hour <= 6) {
    dangerLevel = "危険";
    message = "深夜の買い物は超危険💥 冷静になって！";
    className = "danger-high";
  } else if (hour >= 18 && hour <= 21) {
    dangerLevel = "注意";
    message = "夜は財布の紐が緩みがち🌙 気をつけて";
    className = "danger-medium";
  } else {
    dangerLevel = "安全";
    message = "今の時間なら冷静に判断できそう☀️";
    className = "danger-low";
  }

  return (
    <div className={`danger-indicator ${className}`}>
      <div className="danger-header">
        <span className="danger-icon">⚠️</span>
        <span className="danger-level">{dangerLevel}</span>
      </div>
      <p className="danger-message">{message}</p>
    </div>
  );
};
