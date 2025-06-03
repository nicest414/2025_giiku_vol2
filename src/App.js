import React, { useState, useEffect } from 'react';
import { aiService } from './services/aiService';
import { levelService } from './services/levelService';
import { purchaseHistoryService } from './services/purchaseHistoryService';
import { useCartData, useCountdownTimer } from './hooks';
import { 
  ProductCard, 
  ProgressBar, 
  TimerDisplay, 
  ProceedButton, 
  LoadingSpinner, 
  ErrorDisplay,
  UserLevelDisplay,
  AchievementDisplay,
  LevelUpNotification,
  DangerLevelIndicator,
  PurchaseHistoryDisplay,
  Sidebar
} from './components';
import './App.css';

// 🎭 テスト用ダミーデータ
const DUMMY_CART_DATA = [
  {
    title: "【Amazon限定ブランド】 Amazonベーシック ワイヤレス充電器 15W Qi認証 iPhone/Android対応 ブラック",
    price: "¥2,980",
    imageUrl: "/logo192.png" // 一時的にローカル画像を使用
  },
  {
    title: "Fire TV Stick 4K Max - Alexa対応音声認識リモコン(第3世代)付属 | ストリーミングメディアプレーヤー",
    price: "¥6,980",
    imageUrl: "/logo192.png" // 一時的にローカル画像を使用
  },
  {
    title: "【Amazon.co.jp限定】コカ・コーラ 500ml×24本",
    price: "¥2,376",
    imageUrl: "/logo192.png" // 一時的にローカル画像を使用
  }
];

const DUMMY_AI_RESPONSES = [
  "うわ〜またワイヤレス充電器？💦 うち前から言ってるけど、ケーブルで充電した方が速いのに〜😤 本当に必要なの？それとも「なんかカッコいいから」って理由？正直に言いなよ〜💕",
  "Fire TV Stick買うの？😏 まあいいけど〜...でもさ、今持ってるスマホやPCで十分動画見れるじゃん？わざわざテレビで見る必要ある？もしかして一人暮らしで寂しいから大画面で見たいとか？🤭",
  "コーラ24本とか...😅 うちマジで心配になってきた💦 糖分めっちゃ取りすぎじゃない？体のこと考えてる？それとも「まとめ買いの方がお得」とか言い訳してない？お水も飲みなよ〜💧"
];

// テストモードフラグ (開発時のみtrue)
const IS_TEST_MODE = process.env.NODE_ENV === 'development' && window.location.search.includes('test=true');

/**
 * メインアプリケーションコンポーネント
 * Amazonカート商品の表示とAI分析結果の管理を担当
 */
function App() {
  // カートデータとローディング状態を管理
  const { cartItems, isLoading: isCartLoading, hasError: hasCartError, refetch } = useCartData();
  
  // 🎭 テストモード用の状態
  const [testCartItems, setTestCartItems] = useState([]);
  const [isTestDataLoaded, setIsTestDataLoaded] = useState(false);
  
  // 実際に使用するカートデータを決定
  const actualCartItems = IS_TEST_MODE ? testCartItems : cartItems;
  const actualIsCartLoading = IS_TEST_MODE ? false : isCartLoading;
  const actualHasCartError = IS_TEST_MODE ? false : hasCartError;
  
  // カウントダウンタイマーを管理
  const { 
    timeLeft, 
    isCompleted: isTimerCompleted, 
    progress, 
    startTimer 
  } = useCountdownTimer(30);
  // レベルシステム状態管理
  const [userStats, setUserStats] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({});

  // サイドバー状態管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI分析の状態管理
  const [aiResponses, setAiResponses] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasAiError, setHasAiError] = useState(false);// レベルシステム初期化
  useEffect(() => {
    const stats = levelService.getUserStats();
    setUserStats(stats);
    console.log('👤 ユーザーレベル読み込み:', stats);
  }, []);

  // 🎭 テストモード用のダミーデータ読み込み
  useEffect(() => {
    if (IS_TEST_MODE && !isTestDataLoaded) {
      console.log('🎭 テストモード: ダミーデータを読み込み中...');
      // データ設定とタイマー開始を同時に実行
      setTestCartItems(DUMMY_CART_DATA);
      setAiResponses(DUMMY_AI_RESPONSES);
      setIsTestDataLoaded(true);
      console.log('🎭 テストモード: タイマー開始!');
      startTimer(); // 即座にタイマー開始
      
      // レベルシステム: テストモードでは毒舌耐性経験値を追加
      const result = levelService.onEnduredToxicity();
      if (result.leveledUp) {
        setLevelUpData({
          newLevel: result.newLevel,
          newTitle: levelService.getLevelTitle(result.newLevel)
        });
        setShowLevelUp(true);
      }
      setUserStats(levelService.getUserStats());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestDataLoaded, startTimer]);

  // タイマー完了時の処理
  useEffect(() => {
    if (isTimerCompleted && actualCartItems.length > 0) {
      // 購買阻止成功として経験値追加
      const totalValue = actualCartItems.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
        return sum + price;
      }, 0);
      
      const result = levelService.onPurchaseBlocked(totalValue);
      console.log('💰 購買阻止完了:', { totalValue, result });
      
      if (result.leveledUp) {
        setLevelUpData({
          newLevel: result.newLevel,
          newTitle: levelService.getLevelTitle(result.newLevel)
        });
        setShowLevelUp(true);
      }
      setUserStats(levelService.getUserStats());
    }
  }, [isTimerCompleted, actualCartItems]);

  /**
   * カート商品に対するAI分析を実行
   * 並列処理でパフォーマンスを向上
   */
  const analyzeCartWithAI = async (items) => {
    if (!items || items.length === 0) return;

    setIsAiLoading(true);
    setHasAiError(false);

    try {
      console.log(`${items.length}個の商品をAI分析開始`);
      const responses = await aiService.analyzeCartItems(items);
      setAiResponses(responses);
      
      // AI分析完了後にタイマー開始
      startTimer();
    } catch (error) {
      console.error("AI分析エラー:", error);
      setHasAiError(true);
    } finally {
      setIsAiLoading(false);
    }
  };  // タイマー完了時の処理
  useEffect(() => {
    if (isTimerCompleted && actualCartItems.length > 0) {
      // 📊 購入阻止の記録を保存
      const totalAmount = actualCartItems.reduce((sum, item) => {
        // 価格から数値を抽出（¥2,980 → 2980）
        const priceNum = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
        return sum + priceNum;
      }, 0);
      
      purchaseHistoryService.recordBlocked(actualCartItems, aiResponses, totalAmount);
      
      // 🎮 レベルシステム: タイマー完了経験値
      const result = levelService.onTimerCompleted();
      if (result.leveledUp) {
        setLevelUpData({
          newLevel: result.newLevel,
          newTitle: result.newTitle,
          expGained: result.expGained
        });
        setShowLevelUp(true);
      }
      
      // ユーザー統計を更新
      setUserStats(levelService.getUserStats());
      
      console.log('⏰ タイマー完了 - 購入阻止記録完了:', {
        items: actualCartItems.length,
        amount: totalAmount,
        level: result
      });
    }  }, [isTimerCompleted, actualCartItems, aiResponses]);

  /**
   * カートデータが取得できたらAI分析を開始
   */
  useEffect(() => {
    if (!IS_TEST_MODE && actualCartItems.length > 0 && aiResponses.length === 0) {
      analyzeCartWithAI(actualCartItems);
    }
  }, [actualCartItems]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Amazonカートページに戻る処理
   */
  const handleProceedToCart = () => {
    if (isTimerCompleted) {
      window.location.href = "https://www.amazon.co.jp/gp/cart/view.html?ref_=nav_cart";
    }
  };

  /**
   * エラー時のリトライ処理
   */
  const handleRetry = () => {
    if (actualHasCartError) {
      refetch();
    } else if (hasAiError) {
      analyzeCartWithAI(actualCartItems);
    }
  };

  // ローディング状態の表示
  if (actualIsCartLoading || (IS_TEST_MODE && !isTestDataLoaded)) {
    return (
      <div className="App">
        <LoadingSpinner message={IS_TEST_MODE ? "ダミーデータを準備中..." : "カート情報を取得中..."} />
      </div>
    );
  }

  // エラー状態の表示
  if (actualHasCartError || (hasAiError && aiResponses.length === 0)) {
    return (
      <div className="App">
        <ErrorDisplay 
          message={actualHasCartError ? "カート情報の取得に失敗しました" : "AI分析に失敗しました"}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // カートが空の場合
  if (actualCartItems.length === 0) {
    return (
      <div className="App">
        <h1>Amazonカート情報</h1>
        <div className="empty-cart">
          <p>{IS_TEST_MODE ? "テストモードが有効になっていません" : "カートに商品がありません"}</p>
          <button onClick={() => window.location.href = IS_TEST_MODE ? "?test=true" : "https://www.amazon.co.jp"}>
            {IS_TEST_MODE ? "テストモードを開始" : "Amazonに戻る"}
          </button>
        </div>
      </div>
    );
  }  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* レベルアップ通知 */}
      <LevelUpNotification 
        show={showLevelUp}
        newLevel={levelUpData.newLevel}
        newTitle={levelUpData.newTitle}
        onClose={() => setShowLevelUp(false)}
      />

      {/* サイドバー */}
      <Sidebar 
        userStats={userStats}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <header className="app-header">
        <h1>🛒 Amazonカート分析結果</h1>
        <p className="subtitle">メスガキAIがあなたの買い物をチェック中... 💕</p>
        
        {/* シンプルなレベル表示（ヘッダー用） */}
        {userStats && (
          <div className="header-level-display">
            <span className="level-badge">Lv.{userStats.level}</span>
            <span className="level-title">{userStats.title}</span>
          </div>
        )}
      </header>      <main className="app-main">
        {/* 危険度インジケーター */}
        <DangerLevelIndicator />

        {/* 商品リスト */}
        <div className="products-container">
          {actualCartItems.map((item, index) => (
            <ProductCard
              key={`${item.title}-${index}`}
              item={item}
              message={aiResponses[index]}
              isLoading={isAiLoading && !aiResponses[index]}
            />
          ))}
        </div>

        {/* AI分析中の表示 */}
        {isAiLoading && (
          <div className="ai-loading-section">
            <LoadingSpinner message="メスガキが毒舌準備中..." />
          </div>
        )}

        {/* タイマーとボタンの統合セクション - タイマー完了後は非表示 */}
        {!isTimerCompleted && (
          <div className="timer-section">
            <ProgressBar progress={progress} />
            <TimerDisplay timeLeft={timeLeft} isCompleted={isTimerCompleted} />
          </div>
        )}
        
        {/* タイマー完了メッセージ */}
        {isTimerCompleted && (
          <div className="timer-completed-section">
            <div className="completion-message">
              ✨ 考える時間が終わりました ✨
              <p className="completion-subtitle">冷静になれましたか？💕</p>
              <p className="exp-gained">経験値を獲得しました！🎉</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>💡 本当に必要な買い物か、もう一度考えてみてね</p>
        {userStats && (
          <p className="level-footer">
            現在 Lv.{userStats.level} {userStats.title} • 
            総節約額 ¥{userStats.totalSaved.toLocaleString()}
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;