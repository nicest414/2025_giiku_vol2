import React from 'react';

// 購入履歴とサイドバー
export { PurchaseHistoryDisplay } from './PurchaseHistoryDisplay';
export { Sidebar } from './Sidebar';

// リファクタリング済みの主要コンポーネント
export { TimerSection, TimerCompletedSection } from './TimerSection';
export { DecisionButtonsSection, DecisionResultSection } from './DecisionSection';
export { AppHeader } from './AppHeader';
export { ProductsSection } from './ProductsSection';
export { AppFooter } from './AppFooter';

// UI基本要素（分離済み）
export { 
  LoadingSpinner,
  ErrorDisplay,
  ProgressBar,
  TimerDisplay,
  ProceedButton,
  DangerLevelIndicator
} from './ui/BasicComponents';

// 商品表示関連（分離済み）
export {
  ProductInfo,
  CharacterSection,
  ProductCard
} from './product/ProductComponents';

// ゲーミフィケーション関連（分離済み）
export {
  UserLevelDisplay,
  AchievementDisplay,
  LevelUpNotification
} from './gamification/LevelComponents';
