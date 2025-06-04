import React from 'react';

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