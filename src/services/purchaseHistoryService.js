/**
 * 購買履歴管理サービス
 * 過去の買い物データを記録・分析する機能
 */

/**
 * 購買履歴サービスクラス
 * 購入データの記録、分析、統計情報提供を担当
 */
class PurchaseHistoryService {
  constructor() {
    this.storageKey = 'mesugaki_purchase_history';
    this.regretKey = 'mesugaki_regret_items';
  }

  /**
   * 購買阻止記録を保存
   * @param {Array} cartItems - カート商品一覧
   * @param {Array} aiResponses - AIの毒舌コメント
   * @param {number} blockedAmount - 阻止した金額
   */
  recordBlocked(cartItems, aiResponses, blockedAmount) {
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'blocked',
      items: cartItems.map((item, index) => ({
        title: item.title,
        price: item.price,
        aiComment: aiResponses[index] || '',
        category: this.categorizeItem(item.title)
      })),
      totalAmount: blockedAmount,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    this.saveRecord(record);
    console.log('🛡️ 購買阻止記録:', record);
  }

  /**
   * 実際の購入記録を保存（Chrome拡張との連携用）
   * @param {Array} purchasedItems - 購入した商品
   * @param {number} totalAmount - 購入金額
   */
  recordPurchase(purchasedItems, totalAmount) {
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'purchased',
      items: purchasedItems.map(item => ({
        title: item.title,
        price: item.price,
        category: this.categorizeItem(item.title)
      })),
      totalAmount: totalAmount,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    this.saveRecord(record);
    console.log('💳 購入記録:', record);
  }

  /**
   * 記録をローカルストレージに保存
   */
  saveRecord(record) {
    try {
      const history = this.getHistory();
      history.push(record);
      
      // 最新1000件まで保持
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('購買履歴保存エラー:', error);
    }
  }

  /**
   * 全履歴を取得
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('購買履歴読み込みエラー:', error);
      return [];
    }
  }

  /**
   * 商品をカテゴリ分類
   */
  categorizeItem(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('ファッション') || lowerTitle.includes('服') || lowerTitle.includes('靴')) {
      return 'ファッション';
    } else if (lowerTitle.includes('電子機器') || lowerTitle.includes('スマホ') || lowerTitle.includes('pc')) {
      return '電子機器';
    } else if (lowerTitle.includes('食品') || lowerTitle.includes('飲み物') || lowerTitle.includes('コーラ')) {
      return '食品・飲料';
    } else if (lowerTitle.includes('本') || lowerTitle.includes('書籍')) {
      return '書籍';
    } else if (lowerTitle.includes('ゲーム') || lowerTitle.includes('おもちゃ')) {
      return 'エンタメ';
    } else if (lowerTitle.includes('化粧品') || lowerTitle.includes('美容')) {
      return '美容・健康';
    } else if (lowerTitle.includes('家電') || lowerTitle.includes('充電器') || lowerTitle.includes('fire tv')) {
      return '家電';
    } else {
      return 'その他';
    }
  }

  /**
   * 月次統計を生成
   */
  getMonthlyStats(year = null, month = null) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth();
    
    const history = this.getHistory();
    const monthlyRecords = history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.getFullYear() === targetYear && 
             recordDate.getMonth() === targetMonth;
    });

    const blockedRecords = monthlyRecords.filter(r => r.type === 'blocked');
    const purchasedRecords = monthlyRecords.filter(r => r.type === 'purchased');

    const totalBlocked = blockedRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalPurchased = purchasedRecords.reduce((sum, r) => sum + r.totalAmount, 0);

    // カテゴリ別分析
    const categoryStats = {};
    [...blockedRecords, ...purchasedRecords].forEach(record => {
      record.items.forEach(item => {
        if (!categoryStats[item.category]) {
          categoryStats[item.category] = { blocked: 0, purchased: 0 };
        }
        categoryStats[item.category][record.type] += 1;
      });
    });

    // 時間帯別分析
    const timeStats = Array(24).fill(0);
    blockedRecords.forEach(record => {
      timeStats[record.timeOfDay] += 1;
    });

    return {
      period: `${targetYear}年${targetMonth + 1}月`,
      blockedCount: blockedRecords.length,
      purchasedCount: purchasedRecords.length,
      totalSaved: totalBlocked,
      totalSpent: totalPurchased,
      blockRate: blockedRecords.length > 0 ? 
        (blockedRecords.length / (blockedRecords.length + purchasedRecords.length)) * 100 : 0,
      categoryStats,
      dangerousHours: this.findDangerousHours(timeStats),
      impulseRating: this.calculateImpulseRating(blockedRecords, purchasedRecords)
    };
  }

  /**
   * 危険な時間帯を特定
   */
  findDangerousHours(timeStats) {
    const maxBlocks = Math.max(...timeStats);
    const dangerousHours = [];
    
    timeStats.forEach((count, hour) => {
      if (count > 0 && count >= maxBlocks * 0.7) {
        dangerousHours.push(hour);
      }
    });
    
    return dangerousHours;
  }

  /**
   * 衝動買い傾向を計算
   */
  calculateImpulseRating(blockedRecords, purchasedRecords) {
    const totalRecords = blockedRecords.length + purchasedRecords.length;
    if (totalRecords === 0) return 0;
    
    const blockRate = blockedRecords.length / totalRecords;
    
    if (blockRate >= 0.8) return 5; // 非常に冷静
    if (blockRate >= 0.6) return 4; // 冷静
    if (blockRate >= 0.4) return 3; // 普通
    if (blockRate >= 0.2) return 2; // 衝動的
    return 1; // 非常に衝動的
  }

  /**
   * 後悔商品を記録
   * @param {string} itemTitle - 商品タイトル
   * @param {string} reason - 後悔理由
   */
  recordRegret(itemTitle, reason) {
    try {
      const regrets = this.getRegrets();
      regrets.push({
        id: Date.now(),
        itemTitle,
        reason,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(this.regretKey, JSON.stringify(regrets));
      console.log('😢 後悔商品記録:', { itemTitle, reason });
    } catch (error) {
      console.error('後悔商品記録エラー:', error);
    }
  }

  /**
   * 後悔商品一覧を取得
   */
  getRegrets() {
    try {
      const data = localStorage.getItem(this.regretKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('後悔商品読み込みエラー:', error);
      return [];
    }
  }

  /**
   * 類似商品の購入履歴をチェック
   * @param {string} itemTitle - チェックする商品タイトル
   */
  checkSimilarPurchases(itemTitle) {
    const history = this.getHistory();
    const keywords = itemTitle.toLowerCase().split(' ').slice(0, 3); // 最初の3単語で判定
    
    const similarItems = history.filter(record => {
      return record.items.some(item => {
        const itemKeywords = item.title.toLowerCase();
        return keywords.some(keyword => itemKeywords.includes(keyword));
      });
    });

    return {
      hasSimilar: similarItems.length > 0,
      count: similarItems.length,
      lastPurchase: similarItems.length > 0 ? 
        new Date(similarItems[similarItems.length - 1].timestamp).toLocaleDateString() : null,
      warning: similarItems.length >= 3 ? 
        '⚠️ 類似商品を3回以上購入しています！本当に必要ですか？' : null
    };
  }

  /**
   * 週次レポートを生成
   */
  getWeeklyReport() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const history = this.getHistory();
    const weeklyRecords = history.filter(record => {
      return new Date(record.timestamp) >= oneWeekAgo;
    });

    const blockedRecords = weeklyRecords.filter(r => r.type === 'blocked');
    const totalSaved = blockedRecords.reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      period: '過去7日間',
      blockedCount: blockedRecords.length,
      totalSaved: totalSaved,
      averageDaily: totalSaved / 7,
      topCategory: this.getTopCategory(blockedRecords),
      message: this.generateWeeklyMessage(blockedRecords.length, totalSaved)
    };
  }

  /**
   * 最も阻止された商品カテゴリを取得
   */
  getTopCategory(records) {
    const categoryCounts = {};
    
    records.forEach(record => {
      record.items.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });
    });

    const topCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return topCategory ? topCategory[0] : 'なし';
  }

  /**
   * 週次メッセージを生成
   */
  generateWeeklyMessage(blockedCount, totalSaved) {
    if (blockedCount === 0) {
      return "今週はメスガキの出番なし！優秀だったね〜💕";
    } else if (blockedCount <= 2) {
      return `今週は${blockedCount}回止められたけど、まあまあかな😊`;
    } else if (blockedCount <= 5) {
      return `今週は${blockedCount}回も止められちゃった💦 ちょっと危険よ？`;
    } else {
      return `今週は${blockedCount}回も止められた！メスガキ大活躍だったじゃん😤`;
    }
  }
  /**
   * データをクリア（デバッグ用）
   */
  clearHistory() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.regretKey);
    console.log('🗑️ 購買履歴をクリアしました');
  }

  /**
   * 統計情報を取得（ダッシュボード用）
   */
  getStats() {
    const history = this.getHistory();
    const regrets = this.getRegretItems();
    
    const blockedRecords = history.filter(r => r.type === 'blocked');
    const purchasedRecords = history.filter(r => r.type === 'purchased');
    
    const totalBlocked = blockedRecords.length;
    const totalPurchased = purchasedRecords.length;
    const totalSavedAmount = blockedRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalSpentAmount = purchasedRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    
    // カテゴリ別統計
    const categoryStats = {};
    [...blockedRecords, ...purchasedRecords].forEach(record => {
      record.items.forEach(item => {
        if (!categoryStats[item.category]) {
          categoryStats[item.category] = { count: 0, amount: 0 };
        }
        categoryStats[item.category].count += 1;
        const itemPrice = parseInt(item.price.replace(/[¥,]/g, '')) || 0;
        categoryStats[item.category].amount += itemPrice;
      });
    });
    
    // 後悔率の計算
    const regretRate = totalPurchased > 0 ? 
      Math.round((regrets.length / totalPurchased) * 100) : 0;
    
    return {
      totalBlocked,
      totalPurchased,
      totalSavedAmount,
      totalSpentAmount,
      regretRate,
      categoryStats
    };
  }

  /**
   * 表示用の後悔アイテム一覧を取得
   */
  getRegretItems() {
    const regrets = this.getRegrets();
    return regrets.map(regret => ({
      title: regret.itemTitle,
      reason: regret.reason,
      price: '不明', // 実際の価格データがないため
      addedAt: regret.timestamp
    }));
  }
}

export const purchaseHistoryService = new PurchaseHistoryService();
