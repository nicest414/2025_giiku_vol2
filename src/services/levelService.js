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
  SAVED_10000: {
    id: "saved_10000",
    title: "節約マスター",
    description: "1万円の節約達成！",
    icon: "💰",
    exp: 200
  },
  LATE_NIGHT_WARRIOR: {
    id: "late_night_warrior",
    title: "夜更かし買い物戦士",
    description: "深夜2時以降に5回買い物を阻止された",
    icon: "🌙",
    exp: 150
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
    
    // 節約マスター
    if (userData.totalSaved >= 10000 && !achievements.saved_10000) {
      this.unlockAchievement(ACHIEVEMENTS.SAVED_10000);
    }
    
    // 深夜戦士
    if (userData.lateNightBlocks >= 5 && !achievements.late_night_warrior) {
      this.unlockAchievement(ACHIEVEMENTS.LATE_NIGHT_WARRIOR);
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
}

export const levelService = new LevelService();
