import { useState, useEffect, useCallback } from 'react';

/**
 * カートデータ取得とAI分析を管理するカスタムフック
 * Chrome Storage APIとの連携を担当
 */
export const useCartData = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Chrome Storageからカートデータを取得
   * エラーハンドリングとローディング状態管理を含む
   */
  const fetchCartData = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.warn("Chrome Storage APIが利用できません（開発環境？）");
      setIsLoading(false);
      return;
    }

    chrome.storage.local.get("amazonCartItems", (data) => {
      if (chrome.runtime.lastError) {
        console.error("Chrome Storage エラー:", chrome.runtime.lastError);
        setHasError(true);
      } else if (data.amazonCartItems && data.amazonCartItems.length > 0) {
        console.log("カートデータ取得成功:", data.amazonCartItems);
        setCartItems(data.amazonCartItems);
      } else {
        console.warn("カート情報が見つかりません");
        setCartItems([]);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  return {
    cartItems,
    isLoading,
    hasError,
    refetch: fetchCartData
  };
};

/**
 * カウントダウンタイマーを管理するカスタムフック
 * 30秒のクールダウン機能を提供
 */
export const useCountdownTimer = (initialTime = 30) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  /**
   * タイマーを開始する関数
   */
  const startTimer = useCallback(() => {
    console.log('⏰ Timer starting!', { initialTime });
    setIsActive(true);
    setIsCompleted(false);
    setTimeLeft(initialTime);
  }, [initialTime]);

  /**
   * タイマーを停止する関数
   */
  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  /**
   * タイマーをリセットする関数
   */
  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(false);
    setIsCompleted(false);
  }, [initialTime]);
  useEffect(() => {
    let interval = null;
    
    console.log('⏰ Timer effect:', { isActive, timeLeft });

    if (isActive && timeLeft > 0) {
      console.log('⏰ Starting interval timer');
      interval = setInterval(() => {
        setTimeLeft(time => {
          console.log('⏰ Timer tick:', time);
          if (time <= 1) {
            console.log('⏰ Timer completed!');
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        console.log('⏰ Cleaning up interval');
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);  // 進捗率を計算（プログレスバー用）
  // プログレスバーは残り時間を表示するので、timeLeftの割合を計算
  const progress = (timeLeft / initialTime) * 100;
  
  // デバッグログ - より詳細な情報を出力
  console.log('⏰ Timer hook return:', { 
    timeLeft, 
    initialTime, 
    isActive, 
    isCompleted, 
    progress: Math.round(progress * 100) / 100, // 小数点以下2桁で丸める
    progressWidth: `${Math.min(100, Math.max(0, progress))}%`
  });

  return {
    timeLeft,
    isActive,
    isCompleted,
    progress,
    startTimer,
    stopTimer,
    resetTimer
  };
};

/**
 * ローカルストレージを管理するカスタムフック
 * 購買履歴や統計データの永続化を担当
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`localStorage読み込みエラー (${key}):`, error);
      return initialValue;
    }
  });

  /**
   * 値を設定してローカルストレージに保存
   */
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`localStorage保存エラー (${key}):`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};
