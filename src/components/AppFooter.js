import React from 'react';

/**
 * アプリケーションフッターコンポーネント
 */
export const AppFooter = ({ userStats }) => {
  return (
    <footer className="app-footer">
      <p>💡 本当に必要な買い物か、もう一度考えてみてね</p>
      {userStats && (
        <p className="level-footer">
          現在 Lv.{userStats.level} {userStats.title} • 
          総節約額 ¥{userStats.totalSaved.toLocaleString()}
        </p>
      )}
    </footer>
  );
};