import React, { useState, useEffect } from 'react';
import { aiService } from './services/aiService';
import { levelService } from './services/levelService';
import { purchaseHistoryService } from './services/purchaseHistoryService';
import { interventionService } from './services/interventionService';
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
  const [hasAiError, setHasAiError] = useState(false);
    // 📢 介入システム状態管理
  const [interventionData, setInterventionData] = useState(null);
  const [interventionLevel, setInterventionLevel] = useState(1);
  
  // 🛒 購入判断システム状態管理
  const [showDecisionButtons, setShowDecisionButtons] = useState(false);
  const [userDecision, setUserDecision] = useState(null); // 'buy' | 'resist' | null// レベルシステム初期化
  useEffect(() => {
    const stats = levelService.getUserStats();
    setUserStats(stats);
    
    // 📢 介入システム初期化
    const currentLevel = interventionService.calculateResistanceLevel();
    setInterventionLevel(currentLevel);
    
    // 🕵️ 怪しい行動検知: ページ訪問
    interventionService.detectSuspiciousBehavior('repeatVisits');
    
    console.log('👤 ユーザーレベル読み込み:', stats);
    console.log('📢 現在の介入レベル:', currentLevel);
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
      
      // 📢 介入メッセージを生成
      const intervention = interventionService.generateInterventionMessage(items);
      setInterventionData(intervention);
      setInterventionLevel(intervention.level.level);
      
      console.log('📢 介入レベル:', intervention.level.name);
      console.log('💬 介入メッセージ:', intervention.primaryMessage);
      
      const responses = await aiService.analyzeCartItems(items);
      setAiResponses(responses);
      
      // AI分析完了後にタイマー開始
      startTimer();
    } catch (error) {
      console.error("AI分析エラー:", error);
      setHasAiError(true);
      
      // 📢 エラー時も介入失敗として記録
      interventionService.onInterventionFailure();
    } finally {
      setIsAiLoading(false);
    }
  };  // タイマー完了時の処理
  useEffect(() => {
    if (isTimerCompleted && actualCartItems.length > 0 && !userDecision) {
      // 🛒 タイマー完了時は購入判断ボタンを表示
      setShowDecisionButtons(true);
      
      console.log('⏰ タイマー完了 - 購入判断ボタンを表示');
    }
  }, [isTimerCompleted, actualCartItems, userDecision]);

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
   * 📢 介入機能: 強制的な購入を検知・記録
   */
  const handleProceedToCart = () => {
    if (isTimerCompleted) {
      // 🕵️ 連続クリックを検知
      handleRapidClick();
      
      // 📢 ユーザーが介入を無視して購入に進んだ場合
      if (interventionLevel >= 2) {
        handlePurchaseIgnored();
        
        // 緊急レベルの場合は追加の確認
        if (interventionLevel >= 4) {
          const confirmPurchase = window.confirm(
            "🚨 緊急警告 🚨\n\n本当に購入しますか？\nメスガキが必死に止めようとしています😭\n\n確認してください："
          );
          
          if (!confirmPurchase) {
            console.log("📢 緊急レベルで購入を阻止成功");
            interventionService.onInterventionSuccess();
            return;
          }
        }
      }
      
      // 深夜買い物チェック
      const hour = new Date().getHours();
      if (hour >= 22 || hour <= 6) {
        handleSuspiciousBehavior('lateNightShopping');
      }
      
      console.log("🛒 ユーザーがカートページに移動");
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

  /**
   * 🕵️ 怪しい行動を検知して介入レベルを調整
   */
  const handleSuspiciousBehavior = (behaviorType) => {
    const suspiciousCount = interventionService.detectSuspiciousBehavior(behaviorType);
    
    // 怪しい行動が増えたら介入レベルを再計算
    if (suspiciousCount > 0) {
      const newLevel = interventionService.calculateResistanceLevel();
      setInterventionLevel(newLevel);
      
      console.log(`🕵️ 怪しい行動検知: ${behaviorType}, 新しい介入レベル: ${newLevel}`);
      
      // 深夜買い物の場合は特別警告
      if (behaviorType === 'lateNightShopping') {
        console.log('🌙 深夜の買い物を検知しました！');
      }
    }
  };

  /**
   * 📱 連続クリック検知用
   */
  const handleRapidClick = () => {
    handleSuspiciousBehavior('rapidClicking');
  };

  /**
   * 💸 高額商品への急な移行検知
   */
  const handlePriceJump = () => {
    handleSuspiciousBehavior('priceJumping');
  };

  /**
   * 🛒 購入ボタン無視時の処理
   */
  const handlePurchaseIgnored = () => {
    // 介入失敗として記録
    interventionService.onInterventionFailure();
    
    // 新しい介入レベルを計算
    const newLevel = interventionService.calculateResistanceLevel();
    setInterventionLevel(newLevel);
    
    console.log('購入ボタンが無視されました。介入失敗記録');
    console.log('新しい介入レベル:', newLevel);
  };

  /**
   * 🎯 介入統計を取得
   */
  const getInterventionStats = () => {
    return interventionService.getInterventionStats();
  };

  /**
   * 📊 月次レポートを生成・表示
   */
  const handleShowMonthlyReport = () => {
    const monthlyReport = levelService.generateMonthlyReport();
    const interventionStats = interventionService.getInterventionStats();
    
    console.log('📊 月次レポート:', monthlyReport);
    console.log('📢 介入統計:', interventionStats);
    
    // レポートをアラートで表示（実際はモーダルにするべき）
    const reportText = `
🎉 ${monthlyReport.month} 月次レポート 🎉

💰 節約金額: ¥${monthlyReport.totalSaved.toLocaleString()}
🛡️ 衝動買い阻止回数: ${monthlyReport.impulseBlockCount}回
⏰ タイマー完走回数: ${monthlyReport.timerCompletions}回
🌙 深夜阻止回数: ${monthlyReport.lateNightBlocks}回

📊 平均節約額/回: ¥${monthlyReport.averageSavedPerBlock.toLocaleString()}
⭐ メスガキ評価: ${monthlyReport.characterRating.stars}
💬 コメント: ${monthlyReport.characterRating.comment}

📈 介入成功率: ${interventionStats.successRate}%
🔥 現在の抵抗レベル: Lv.${interventionStats.currentResistanceLevel}

💡 改善提案:
${monthlyReport.improvementSuggestions.join('\n')}
    `;
    
    alert(reportText);
  };

  /**
   * 🛒 「買う」ボタンクリック時の処理
   */
  const handleBuyDecision = () => {
    setUserDecision('buy');
    setShowDecisionButtons(false);
    
    // 📢 介入失敗として記録
    interventionService.onInterventionFailure();
    
    console.log('🛒 ユーザーが購入を選択しました');
    
    // 購入履歴として記録（購入成功）
    const totalAmount = actualCartItems.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
      return sum + priceNum;
    }, 0);
    
    purchaseHistoryService.recordPurchase(actualCartItems, totalAmount);
    
    // Amazonカートページに戻る
    setTimeout(() => {
      window.location.href = "https://www.amazon.co.jp/gp/cart/view.html?ref_=nav_cart";
    }, 2000); // 2秒後にリダイレクト
  };

  /**
   * 🛡️ 「買わない」ボタンクリック時の処理
   */
  const handleResistDecision = () => {
    setUserDecision('resist');
    setShowDecisionButtons(false);
    
    // 📊 購入阻止の記録を保存
    const totalAmount = actualCartItems.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
      return sum + priceNum;
    }, 0);
    
    purchaseHistoryService.recordBlocked(actualCartItems, aiResponses, totalAmount);
    
    // 📢 介入成功として記録
    interventionService.onInterventionSuccess();
    
    // 🎮 レベルシステム: 踏みとどまり成功経験値
    const result = levelService.onPurchaseBlocked(totalAmount);
    if (result.leveledUp) {
      setLevelUpData({
        newLevel: result.newLevel,
        newTitle: levelService.getLevelTitle(result.newLevel),
        expGained: result.addedExp
      });
      setShowLevelUp(true);
    }
    
    // ユーザー統計を更新
    setUserStats(levelService.getUserStats());
    
    console.log('🛡️ ユーザーが踏みとどまりました！', {
      items: actualCartItems.length,
      amount: totalAmount,
      level: result
    });
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
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''} intervention-level-${interventionLevel}`}>
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
        onShowMonthlyReport={handleShowMonthlyReport}
        interventionStats={getInterventionStats()}
      />

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
        {isTimerCompleted && !showDecisionButtons && !userDecision && (
          <div className="timer-completed-section">
            <div className="completion-message">
              ✨ 考える時間が終わりました ✨
              <p className="completion-subtitle">冷静になれましたか？💕</p>
              <p className="exp-gained">経験値を獲得しました！🎉</p>
            </div>
          </div>
        )}

        {/* 🛒 購入判断ボタン表示 */}
        {showDecisionButtons && !userDecision && (
          <div className="decision-buttons-section">
            <div className="decision-message">
              <h3>🤔 最終決断の時間です</h3>
              <p>メスガキの助言を聞いて、どうしますか？</p>
            </div>
            <div className="decision-buttons">
              <button 
                className="decision-button resist-button"
                onClick={handleResistDecision}
              >
                <span className="button-icon">🛡️</span>
                <span className="button-text">踏みとどまる</span>
                <span className="button-subtitle">メスガキの勝利</span>
              </button>
              <button 
                className="decision-button buy-button"
                onClick={handleBuyDecision}
              >
                <span className="button-icon">🛒</span>
                <span className="button-text">それでも買う</span>
                <span className="button-subtitle">Amazon へGO💳</span>
              </button>
            </div>
          </div>
        )}

        {/* ユーザーの決断結果表示 */}
        {userDecision && (
          <div className="decision-result-section">
            {userDecision === 'resist' ? (
              <div className="resist-result">
                <h3>素晴らしい判断です！</h3>
                <p>メスガキの説得が効いたようですね</p>
                <p className="savings-message">
                  ¥{actualCartItems.reduce((sum, item) => {
                    return sum + (parseInt(item.price.replace(/[¥,]/g, '')) || 0);
                  }, 0).toLocaleString()} の節約に成功！
                </p>
              </div>
            ) : (
              <div className="buy-result">
                <div className="result-icon">😤</div>
                <h3>まぁ...仕方ないかぁ～</h3>
                <p>わたしの負け...でも次は絶対止めてあげるからね！</p>
                <p className="redirect-message">
                  2秒後にAmazonカートに戻ります...🛒
                </p>
              </div>
            )}
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