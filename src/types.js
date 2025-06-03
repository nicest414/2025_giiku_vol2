/**
 * カート商品の型定義
 * @typedef {Object} CartItem
 * @property {string} title - 商品タイトル
 * @property {string} price - 商品価格
 * @property {string} imageUrl - 商品画像URL
 */

/**
 * AIレスポンスの型定義
 * @typedef {Object} AIResponse
 * @property {string} message - AIからのメッセージ
 * @property {number} timestamp - タイムスタンプ
 */

/**
 * タイマーの状態管理用の型定義
 * @typedef {Object} TimerState
 * @property {number} timeLeft - 残り時間（秒）
 * @property {boolean} isActive - タイマーがアクティブかどうか
 * @property {boolean} isCompleted - タイマーが完了したかどうか
 */

// デフォルトのエクスポート（JSDocのため）
export default {};
