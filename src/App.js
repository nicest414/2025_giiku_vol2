import React, { useState, useEffect } from 'react';
import { useCartData, useCountdownTimer, useAppState, useBusinessLogic } from './hooks';
import { 
  LoadingSpinner, 
  ErrorDisplay,
  LevelUpNotification,
  Sidebar,
  AppHeader,
  ProductsSection,
  TimerSection,
  TimerCompletedSection,
  DecisionButtonsSection,
  DecisionResultSection,
  AppFooter
} from './components';
import './App.css';

// 🎭 テスト用ダミーデータ
const DUMMY_CART_DATA = [
  {
    title: "【Amazon限定ブランド】 Amazonベーシック ワイヤレス充電器 15W Qi認証 iPhone/Android対応 ブラック",
    price: "¥2,980",
    imageUrl: "/logo192.png"
  },
  {
    title: "Fire TV Stick 4K Max - Alexa対応音声認識リモコン(第3世代)付属 | ストリーミングメディアプレーヤー",
    price: "¥6,980",
    imageUrl: "/logo192.png"
  },
  {
    title: "【Amazon.co.jp限定】コカ・コーラ 500ml×24本",
    price: "¥2,376",
    imageUrl: "/logo192.png"
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
 * メインアプリケーションコンポーネント（リファクタリング版）
 * 600行超のコンポーネントを機能別に分割し、カスタムフックで状態管理を整理
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

  // アプリケーション状態管理
  const appState = useAppState();

  // ビジネスロジック管理
  const businessLogic = useBusinessLogic({
    setAiResponses: appState.setAiResponses,
    setIsAiLoading: appState.setIsAiLoading,
    setHasAiError: appState.setHasAiError,
    setInterventionData: appState.setInterventionData,
    setInterventionLevel: appState.setInterventionLevel,
    setShowDecisionButtons: appState.setShowDecisionButtons,
    setUserDecision: appState.setUserDecision,
    handleLevelUp: appState.handleLevelUp,
    startTimer
  });

  // 🎭 テストモード用のダミーデータ読み込み
  useEffect(() => {
    if (IS_TEST_MODE && !isTestDataLoaded) {
      console.log('🎭 テストモード: ダミーデータを読み込み中...');
      setTestCartItems(DUMMY_CART_DATA);
      appState.setAiResponses(DUMMY_AI_RESPONSES);
      setIsTestDataLoaded(true);
      console.log('🎭 テストモード: タイマー開始!');
      startTimer();
      
      // レベルシステム: テストモードでは毒舌耐性経験値を追加
      const levelService = require('./services/levelService').levelService;
      const result = levelService.onEnduredToxicity();
      appState.handleLevelUp(result);
    }
  }, [isTestDataLoaded, startTimer, appState]);

  // タイマー完了時の処理
  useEffect(() => {
    if (isTimerCompleted && actualCartItems.length > 0 && !appState.userDecision) {
      appState.setShowDecisionButtons(true);
      console.log('⏰ タイマー完了 - 購入判断ボタンを表示');
    }
  }, [isTimerCompleted, actualCartItems, appState.userDecision, appState]);

  // カートデータが取得できたらAI分析を開始
  useEffect(() => {
    if (!IS_TEST_MODE && actualCartItems.length > 0 && appState.aiResponses.length === 0) {
      businessLogic.analyzeCartWithAI(actualCartItems);
    }
  }, [actualCartItems, appState.aiResponses.length, businessLogic]);

  /**
   * エラー時のリトライ処理
   */
  const handleRetry = () => {
    if (actualHasCartError) {
      refetch();
    } else if (appState.hasAiError) {
      businessLogic.analyzeCartWithAI(actualCartItems);
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
  if (actualHasCartError || (appState.hasAiError && appState.aiResponses.length === 0)) {
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
  }

  return (
    <div className={`App ${appState.isSidebarOpen ? 'sidebar-open' : ''} intervention-level-${appState.interventionLevel}`}>
      {/* レベルアップ通知 */}
      <LevelUpNotification 
        show={appState.showLevelUp}
        newLevel={appState.levelUpData.newLevel}
        newTitle={appState.levelUpData.newTitle}
        onClose={() => appState.setShowLevelUp(false)}
      />

      {/* サイドバー */}
      <Sidebar 
        userStats={appState.userStats}
        isOpen={appState.isSidebarOpen}
        onToggle={() => appState.setIsSidebarOpen(!appState.isSidebarOpen)}
        onShowMonthlyReport={businessLogic.handleShowMonthlyReport}
        interventionStats={businessLogic.getInterventionStats()}
      />

      {/* ヘッダー */}
      <AppHeader 
        userStats={appState.userStats}
        interventionData={appState.interventionData}
        interventionLevel={appState.interventionLevel}
      />

      {/* 商品セクション */}
      <ProductsSection 
        cartItems={actualCartItems}
        aiResponses={appState.aiResponses}
        isAiLoading={appState.isAiLoading}
      />

      {/* タイマーセクション */}
      <TimerSection 
        timeLeft={timeLeft}
        isCompleted={isTimerCompleted}
        progress={progress}
      />

      {/* タイマー完了メッセージ */}
      <TimerCompletedSection 
        show={isTimerCompleted && !appState.showDecisionButtons && !appState.userDecision}
      />

      {/* 購入判断ボタン */}
      <DecisionButtonsSection 
        show={appState.showDecisionButtons && !appState.userDecision}
        onResist={() => businessLogic.handleResistDecision(actualCartItems, appState.aiResponses)}
        onBuy={() => businessLogic.handleBuyDecision(actualCartItems)}
      />

      {/* 決断結果表示 */}
      <DecisionResultSection 
        userDecision={appState.userDecision}
        cartItems={actualCartItems}
      />

      {/* フッター */}
      <AppFooter userStats={appState.userStats} />
    </div>
  );
}

export default App;