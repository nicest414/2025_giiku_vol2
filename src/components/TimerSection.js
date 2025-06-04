import React from 'react';
import { ProgressBar, TimerDisplay } from './index';

/**
 * タイマーセクションコンポーネント
 * プログレスバーとタイマー表示を統合
 */
export const TimerSection = ({ timeLeft, isCompleted, progress }) => {
  if (isCompleted) return null;

  return (
    <div className="timer-section">
      <ProgressBar progress={progress} />
      <TimerDisplay timeLeft={timeLeft} isCompleted={isCompleted} />
    </div>
  );
};

/**
 * タイマー完了時のメッセージ表示
 */
export const TimerCompletedSection = ({ show }) => {
  if (!show) return null;

  return (
    <div className="timer-completed-section">
      <div className="completion-message">
        ✨ 考える時間が終わりました ✨
        <p className="completion-subtitle">冷静になれましたか？💕</p>
        <p className="exp-gained">経験値を獲得しました！🎉</p>
      </div>
    </div>
  );
};