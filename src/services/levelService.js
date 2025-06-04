/**
 * ユーザーレベル管理サービス
 * 節約レベルとゲーミフィケーション機能を提供
 */

// レベルタイトル定義
const LEVEL_TITLES = [
  { level: 1, title: "浪費初心者", minExp: 0 },
  { level: 5, title: "見習い節約家", minExp: 100 },
  { level: 10, title: "中級ケチケチマスター", minExp: 500 },
  { level: 15, title: "上級節約戦士", minExp: 1200 },
  { level: 20, title: "メスガキ耐性持ち", minExp: 2000 },
  { level: 25, title: "鋼鉄の意志", minExp: 3000 },
  { level: 30, title: "節約の神", minExp: 5000 }
];

// 実績定義
const ACHIEVEMENTS = {
  FIRST_BLOCK: {
    id: "first_block",
    title: "初回阻止",
    description: "メスガキに初めて止められました💕",
    icon: "🛡️",
    exp: 50
  },
  ENDURANCE_10: {
    id: "endurance_10", 
    title: "メスガキ耐性Lv1",
    description: "毒舌を10回聞いても耐えた",
    icon: "💪",
    exp: 100
  },
  ENDURANCE_50: {
    id: "endurance_50", 
    title: "メスガキ耐性Lv2",
    description: "毒舌を50回聞いても耐えた",
    icon: "🦾",
    exp: 200
  },
  ENDURANCE_100: {
    id: "endurance_100", 
    title: "メスガキ耐性MAX",
    description: "毒舌を100回聞いても買い物した鋼メンタル",
    icon: "🤖",
    exp: 500
  },
  SAVED_10000: {
    id: "saved_10000",
    title: "節約マスター",
    description: "1万円の節約達成！",
    icon: "💰",
    exp: 200
  },
  SAVED_50000: {
    id: "saved_50000",
    title: "節約の神",
    description: "5万円の節約達成！すげぇ〜！",
    icon: "👑",
    exp: 500
  },
  SAVED_100000: {
    id: "saved_100000",
    title: "伝説の守銭奴",
    description: "10万円の節約達成！もう尊敬しかない",
    icon: "💎",
    exp: 1000
  },
  LATE_NIGHT_WARRIOR: {
    id: "late_night_warrior",
    title: "夜更かし買い物戦士",
    description: "深夜2時以降に5回買い物を阻止された",
    icon: "🌙",
    exp: 150
  },
  TIMER_MASTER_10: {
    id: "timer_master_10",
    title: "冷静沈着",
    description: "クールダウンタイマーを10回完走",
    icon: "⏰",
    exp: 100
  },
  TIMER_MASTER_50: {
    id: "timer_master_50",
    title: "我慢の達人",
    description: "クールダウンタイマーを50回完走",
    icon: "🧘",
    exp: 300
  },
  WEEKLY_BLOCKS_10: {
    id: "weekly_blocks_10",
    title: "週間ガード",
    description: "週に10回の衝動買いを阻止",
    icon: "📅",
    exp: 150
  },
  HIGH_VALUE_BLOCK: {
    id: "high_value_block",
    title: "大物狩り",
    description: "5万円以上の買い物を阻止",
    icon: "🎯",
    exp: 300
  },
  CONSISTENCY_30: {
    id: "consistency_30",
    title: "継続は力なり",
    description: "30日連続でアプリを使用",
    icon: "📈",
    exp: 400
  }
};

/**
 * レベルサービスクラス
 * ユーザーのレベル管理と実績管理を担当
 */
class LevelService {
  constructor() {
    this.storageKey = 'mesugaki_user_level';
    this.achievementsKey = 'mesugaki_achievements';
  }

  /**
   * ユーザーレベルデータを取得
   * 初回時はデフォルトデータを作成
   */
  getUserLevel() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('レベルデータ読み込みエラー:', error);
    }

    // デフォルトデータ
    return {
      level: 1,
      exp: 0,
      totalSaved: 0,
      blockedCount: 0,
      enduredCount: 0,
      lateNightBlocks: 0,
      lastLoginDate: new Date().toDateString()
    };
  }

  /**
   * ユーザーレベルデータを保存
   */
  saveUserLevel(levelData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(levelData));
    } catch (error) {
      console.error('レベルデータ保存エラー:', error);
    }
  }

  /**
   * 経験値を追加してレベルアップチェック
   */
  addExperience(exp, reason = '') {
    const userData = this.getUserLevel();
    userData.exp += exp;
    
    console.log(`💫 経験値+${exp} (${reason})`);
    
    // レベルアップチェック
    const newLevel = this.calculateLevel(userData.exp);
    const leveledUp = newLevel > userData.level;
    
    if (leveledUp) {
      userData.level = newLevel;
      console.log(`🎉 レベルアップ！ Lv.${newLevel}`);
    }
    
    this.saveUserLevel(userData);
    
    return {
      leveledUp,
      newLevel: userData.level,
      currentExp: userData.exp,
      addedExp: exp
    };
  }

  /**
   * 経験値からレベルを計算
   */
  calculateLevel(exp) {
    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
      if (exp >= LEVEL_TITLES[i].minExp) {
        return LEVEL_TITLES[i].level;
      }
    }
    return 1;
  }

  /**
   * 現在のレベルタイトルを取得
   */
  getLevelTitle(level = null) {
    const userLevel = level || this.getUserLevel().level;
    
    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
      if (userLevel >= LEVEL_TITLES[i].level) {
        return LEVEL_TITLES[i].title;
      }
    }
    return LEVEL_TITLES[0].title;
  }

  /**
   * 次のレベルまでの経験値を計算
   */
  getExpToNext(currentExp = null, currentLevel = null) {
    const userData = this.getUserLevel();
    const exp = currentExp || userData.exp;
    const level = currentLevel || userData.level;
    
    const nextLevelData = LEVEL_TITLES.find(l => l.level > level);
    if (!nextLevelData) {
      return 0; // 最大レベル
    }
    
    return nextLevelData.minExp - exp;
  }

  /**
   * 購買阻止時の経験値とレベル処理
   */
  onPurchaseBlocked(savedAmount = 0) {
    const userData = this.getUserLevel();
    userData.blockedCount += 1;
    userData.totalSaved += savedAmount;
    
    // 深夜チェック (22:00-06:00)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      userData.lateNightBlocks += 1;
    }
    
    this.saveUserLevel(userData);
    
    // 基本経験値
    let expGained = 10;
    
    // 金額に応じてボーナス
    if (savedAmount >= 10000) expGained += 20;
    else if (savedAmount >= 5000) expGained += 15;
    else if (savedAmount >= 1000) expGained += 10;
    
    // 深夜ボーナス
    if (hour >= 22 || hour <= 6) {
      expGained += 5;
    }
    
    const result = this.addExperience(expGained, `購買阻止 (¥${savedAmount.toLocaleString()}節約)`);
    
    // 実績チェック
    this.checkAchievements(userData);
    
    return result;
  }

  /**
   * メスガキ毒舌に耐えた時の処理
   */
  onEnduredToxicity() {
    const userData = this.getUserLevel();
    userData.enduredCount += 1;
    this.saveUserLevel(userData);
    
    const result = this.addExperience(5, 'メスガキ毒舌耐性');
    this.checkAchievements(userData);
    
    return result;
  }

  /**
   * 実績チェック
   */
  checkAchievements(userData) {
    const achievements = this.getAchievements();
    
    // 初回阻止
    if (userData.blockedCount === 1 && !achievements.first_block) {
      this.unlockAchievement(ACHIEVEMENTS.FIRST_BLOCK);
    }
    
    // メスガキ耐性
    if (userData.enduredCount >= 10 && !achievements.endurance_10) {
      this.unlockAchievement(ACHIEVEMENTS.ENDURANCE_10);
    }
    
    // メスガキ耐性Lv2
    if (userData.enduredCount >= 50 && !achievements.endurance_50) {
      this.unlockAchievement(ACHIEVEMENTS.ENDURANCE_50);
    }
    
    // メスガキ耐性MAX
    if (userData.enduredCount >= 100 && !achievements.endurance_100) {
      this.unlockAchievement(ACHIEVEMENTS.ENDURANCE_100);
    }
    
    // 節約マスター
    if (userData.totalSaved >= 10000 && !achievements.saved_10000) {
      this.unlockAchievement(ACHIEVEMENTS.SAVED_10000);
    }
    
    // 節約の神
    if (userData.totalSaved >= 50000 && !achievements.saved_50000) {
      this.unlockAchievement(ACHIEVEMENTS.SAVED_50000);
    }
    
    // 伝説の守銭奴
    if (userData.totalSaved >= 100000 && !achievements.saved_100000) {
      this.unlockAchievement(ACHIEVEMENTS.SAVED_100000);
    }
    
    // 深夜戦士
    if (userData.lateNightBlocks >= 5 && !achievements.late_night_warrior) {
      this.unlockAchievement(ACHIEVEMENTS.LATE_NIGHT_WARRIOR);
    }
    
    // タイマーマスター (10回)
    if (userData.timerCount >= 10 && !achievements.timer_master_10) {
      this.unlockAchievement(ACHIEVEMENTS.TIMER_MASTER_10);
    }
    
    // タイマーマスター (50回)
    if (userData.timerCount >= 50 && !achievements.timer_master_50) {
      this.unlockAchievement(ACHIEVEMENTS.TIMER_MASTER_50);
    }
    
    // 週間ガード
    if (userData.weeklyBlockedCount >= 10 && !achievements.weekly_blocks_10) {
      this.unlockAchievement(ACHIEVEMENTS.WEEKLY_BLOCKS_10);
    }
    
    // 大物狩り
    if (userData.highValueBlocks >= 1 && !achievements.high_value_block) {
      this.unlockAchievement(ACHIEVEMENTS.HIGH_VALUE_BLOCK);
    }
    
    // 継続は力なり
    if (userData.consecutiveDays >= 30 && !achievements.consistency_30) {
      this.unlockAchievement(ACHIEVEMENTS.CONSISTENCY_30);
    }
  }

  /**
   * 実績解除
   */
  unlockAchievement(achievement) {
    const achievements = this.getAchievements();
    achievements[achievement.id] = {
      ...achievement,
      unlockedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.achievementsKey, JSON.stringify(achievements));
    console.log(`🏆 実績解除: ${achievement.title}`);
    
    // 実績ボーナス経験値
    this.addExperience(achievement.exp, `実績: ${achievement.title}`);
  }

  /**
   * 獲得済み実績を取得
   */
  getAchievements() {
    try {
      const data = localStorage.getItem(this.achievementsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('実績データ読み込みエラー:', error);
      return {};
    }
  }
  /**
   * タイマー完了時の処理
   * 決められた時間我慢できた時の経験値とレベル処理
   */
  onTimerCompleted() {
    const userData = this.getUserLevel();
    
    // タイマー完了の基本経験値
    let expGained = 15;
    
    // 深夜完了ボーナス (22:00-06:00)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      expGained += 10;
    }
    
    const result = this.addExperience(expGained, 'タイマー完了 (我慢成功!)');
    
    // 実績チェック
    this.checkAchievements(userData);
    
    return result;
  }

  /**
   * ユーザー統計情報を取得
   */
  getUserStats() {
    const userData = this.getUserLevel();
    const achievements = this.getAchievements();
    
    return {
      level: userData.level,
      title: this.getLevelTitle(userData.level),
      exp: userData.exp,
      expToNext: this.getExpToNext(),
      totalSaved: userData.totalSaved,
      blockedCount: userData.blockedCount,
      achievementCount: Object.keys(achievements).length,
      achievements: achievements
    };
  }

  /**
   * 月次レポートを生成
   * READMEのアイデアを実装！
   */
  generateMonthlyReport() {
    const userData = this.getUserLevel();
    const achievements = this.getAchievements();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // 月次データ取得（実際は購買履歴から計算するけど、とりあえず基本実装）
    const monthlyData = {
      totalSaved: userData.totalSaved, // 実際は月次分だけ計算
      impulseBlockCount: userData.blockedCount,
      timerCompletions: userData.timerCompletions || 0,
      lateNightBlocks: userData.lateNightBlocks,
      averageSavedPerBlock: userData.blockedCount > 0 ? Math.round(userData.totalSaved / userData.blockedCount) : 0,
      characterRating: this.calculateCharacterRating(userData),
      topBlockedCategories: this.getTopBlockedCategories(),
      improvementSuggestions: this.getImprovementSuggestions(userData)
    };

    return {
      month: currentMonth,
      ...monthlyData,
      reportGenerated: new Date().toISOString(),
      userLevel: userData.level,
      userTitle: this.getLevelTitle(userData.level)
    };
  }

  /**
   * メスガキキャラの働きぶりを評価
   */
  calculateCharacterRating(userData) {
    let rating = 1;
    
    // 阻止回数で評価
    if (userData.blockedCount >= 50) rating = 5;
    else if (userData.blockedCount >= 30) rating = 4;
    else if (userData.blockedCount >= 15) rating = 3;
    else if (userData.blockedCount >= 5) rating = 2;
    
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const comments = [
      "まだまだ甘い！うちがもっと厳しくしてあげる💢",
      "少しは成長したかも...でもまだまだよ😏",
      "まぁまぁ頑張ってるじゃん！でも油断禁物🤭",
      "すごいじゃん！うちの指導の成果ね〜💕",
      "完璧！うちのことマスターしたわね👑"
    ];
    
    return {
      stars,
      rating,
      comment: comments[rating - 1]
    };
  }

  /**
   * よく阻止されるカテゴリTOP3（ダミーデータ）
   */
  getTopBlockedCategories() {
    return [
      { category: "ファッション", count: 12, percentage: 40 },
      { category: "電子機器", count: 8, percentage: 27 },
      { category: "本・雑誌", count: 5, percentage: 17 }
    ];
  }

  /**
   * 改善提案を生成
   */
  getImprovementSuggestions(userData) {
    const suggestions = [];
    
    if (userData.lateNightBlocks > 10) {
      suggestions.push("深夜の買い物が多いね〜💤 スマホを寝室に持ち込まないのがおすすめ！");
    }
    
    if (userData.blockedCount < 5) {
      suggestions.push("まだ衝動買い阻止が少ないかも🤔 もっとうちに頼って！");
    }
    
    if (userData.totalSaved < 5000) {
      suggestions.push("節約額がまだまだ〜💸 一回の金額を意識してみて！");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("完璧な節約ライフ！この調子で頑張って〜✨");
    }
    
    return suggestions;
  }

  /**
   * 週次統計を取得
   */
  getWeeklyStats() {
    const userData = this.getUserLevel();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // 実際は日付フィルタリングが必要だけど、基本実装
    return {
      weeklyBlocks: Math.min(userData.blockedCount, 15), // 週間分として仮計算
      weeklySaved: Math.min(userData.totalSaved, 30000),
      averageBlocksPerDay: Math.round(userData.blockedCount / 7),
      improvementFromLastWeek: "+15%" // ダミーデータ
    };
  }
}

export const levelService = new LevelService();
