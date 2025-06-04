/**
 * 段階的介入エスカレーションサービス
 * READMEの「より強力な介入システム」を実装！
 * ユーザーの抵抗レベルに応じて介入を強化していく💪
 */

// 介入レベル定義
const INTERVENTION_LEVELS = {
  GENTLE: {
    level: 1,
    name: "優しい警告",
    description: "まだ余裕がある時の軽い注意",
    icon: "😊",
    intensity: "low"
  },
  FIRM: {
    level: 2, 
    name: "きっぱり警告",
    description: "少し強めの口調で注意",
    icon: "😤",
    intensity: "medium"
  },
  AGGRESSIVE: {
    level: 3,
    name: "本気モード",
    description: "毒舌全開で阻止に来る",
    icon: "😡",
    intensity: "high"
  },
  EMERGENCY: {
    level: 4,
    name: "緊急事態",
    description: "画面ロック級の強制介入",
    icon: "🚨",
    intensity: "maximum"
  }
};

// 心理的圧迫パターン
const PSYCHOLOGICAL_PRESSURE = {
  GUILT_TRIP: {
    type: "guilt",
    messages: [
      "また無駄遣いするの？😔",
      "前回買った○○、まだ使ってないよね...？",
      "お母さんが泣いてるよ〜👵💧",
      "貯金残高見てみなよ...現実と向き合って💸"
    ]
  },
  REALITY_CHECK: {
    type: "reality",
    messages: [
      "これ買ったら今月の食費が...🍜",
      "旅行資金がまた遠のくね〜✈️💸",
      "本当に必要？3日後も欲しいと思う？🤔",
      "同じ値段でもっと良いもの買えるよ？💡"
    ]
  },
  FUTURE_REGRET: {
    type: "regret",
    messages: [
      "1週間後に絶対後悔してる未来が見える👀",
      "クローゼットの肥やしになる予感しかしない👗📦",
      "使わずにメルカリ行きのパターンでしょ？📱",
      "「なんで買ったんだろう...」って言ってる顔が浮かぶ😅"
    ]
  }
};

/**
 * 介入エスカレーションサービスクラス
 */
class InterventionService {
  constructor() {
    this.storageKey = 'mesugaki_intervention_data';
    this.sessionKey = 'mesugaki_session_resistance';
  }

  /**
   * 介入データを取得
   */
  getInterventionData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('介入データ読み込みエラー:', error);
    }

    return {
      totalInterventions: 0,
      successfulBlocks: 0,
      failedBlocks: 0,
      consecutiveIgnores: 0,
      lastInterventionTime: null,
      resistanceLevel: 1,
      userBehaviorPattern: this.initBehaviorPattern()
    };
  }

  /**
   * 初期行動パターンデータ
   */
  initBehaviorPattern() {
    return {
      rapidClicking: 0,
      lateNightShopping: 0,
      repeatVisits: 0,
      priceJumping: 0,
      sessionTime: 0
    };
  }

  /**
   * 介入データを保存
   */
  saveInterventionData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('介入データ保存エラー:', error);
    }
  }

  /**
   * ユーザーの抵抗レベルを計算
   * READMEの「段階的エスカレーション」を実装
   */
  calculateResistanceLevel() {
    const data = this.getInterventionData();
    const session = this.getSessionData();
    
    let resistanceScore = 0;
    
    // 連続無視回数による加算
    resistanceScore += data.consecutiveIgnores * 2;
    
    // 失敗率による加算
    const failureRate = data.totalInterventions > 0 ? 
      data.failedBlocks / data.totalInterventions : 0;
    resistanceScore += failureRate * 10;
    
    // セッション内の怪しい行動による加算
    resistanceScore += session.suspiciousBehaviors * 3;
    
    // 時間帯補正（深夜は判断力低下）
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      resistanceScore += 5;
    }
    
    // レベル判定
    if (resistanceScore >= 25) return 4; // 緊急事態
    if (resistanceScore >= 15) return 3; // 本気モード  
    if (resistanceScore >= 8) return 2;  // きっぱり警告
    return 1; // 優しい警告
  }

  /**
   * セッションデータを取得
   */
  getSessionData() {
    try {
      const data = sessionStorage.getItem(this.sessionKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('セッションデータ読み込みエラー:', error);
    }

    return {
      startTime: Date.now(),
      clickCount: 0,
      pageVisits: 0,
      suspiciousBehaviors: 0,
      interventionAttempts: 0
    };
  }

  /**
   * セッションデータを保存
   */
  saveSessionData(data) {
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
    } catch (error) {
      console.error('セッションデータ保存エラー:', error);
    }
  }

  /**
   * 怪しい行動を検知
   */
  detectSuspiciousBehavior(behaviorType) {
    const session = this.getSessionData();
    const data = this.getInterventionData();
    
    switch (behaviorType) {
      case 'rapidClicking':
        session.clickCount += 1;
        if (session.clickCount > 10) {
          session.suspiciousBehaviors += 1;
          data.userBehaviorPattern.rapidClicking += 1;
        }
        break;
        
      case 'lateNightShopping':
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) {
          session.suspiciousBehaviors += 1;
          data.userBehaviorPattern.lateNightShopping += 1;
        }
        break;
        
      case 'repeatVisits':
        session.pageVisits += 1;
        if (session.pageVisits > 5) {
          session.suspiciousBehaviors += 1;
          data.userBehaviorPattern.repeatVisits += 1;
        }
        break;
        
      case 'priceJumping':
        session.suspiciousBehaviors += 1;
        data.userBehaviorPattern.priceJumping += 1;
        break;
    }
    
    this.saveSessionData(session);
    this.saveInterventionData(data);
    
    return session.suspiciousBehaviors;
  }

  /**
   * 介入メッセージを生成
   */
  generateInterventionMessage(products = []) {
    const resistanceLevel = this.calculateResistanceLevel();
    const interventionLevel = Object.values(INTERVENTION_LEVELS)
      .find(level => level.level === resistanceLevel);
    
    const data = this.getInterventionData();
    data.totalInterventions += 1;
    data.resistanceLevel = resistanceLevel;
    
    let message = {
      level: interventionLevel,
      primaryMessage: this.getPrimaryMessage(resistanceLevel),
      psychologicalPressure: this.getPsychologicalPressure(resistanceLevel),
      visualEffects: this.getVisualEffects(resistanceLevel),
      actionRequired: this.getRequiredAction(resistanceLevel)
    };
    
    // 特別演出
    if (resistanceLevel >= 3) {
      message.specialEffects = this.getSpecialEffects(data);
    }
    
    this.saveInterventionData(data);
    return message;
  }

  /**
   * レベル別メッセージ取得
   */
  getPrimaryMessage(level) {
    const messages = {
      1: [
        "ちょっと待って〜😊 本当に必要？",
        "うち的にはちょっと気になるかも💭",
        "少し考えてみない？✨"
      ],
      2: [
        "おいおい、ちょっと怪しくない？😤",
        "マジで必要なの？しっかり考えて！💢",
        "衝動買いの匂いがプンプンするんだけど〜😏"
      ],
      3: [
        "はぁ？また無駄遣いしようとしてる！😡",
        "いい加減にしなさいよ！💢💢",
        "あんたのお財布をうちが守ってあげる！👿"
      ],
      4: [
        "🚨緊急事態発生🚨 完全に正気を失ってる！",
        "もう我慢できない！強制的に止めるから！💀",
        "最終警告よ！これ以上は許さないから！👹"
      ]
    };
    
    const levelMessages = messages[level] || messages[1];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }

  /**
   * 心理的圧迫メッセージ取得
   */
  getPsychologicalPressure(level) {
    if (level < 2) return null;
    
    const pressureTypes = Object.values(PSYCHOLOGICAL_PRESSURE);
    const selectedType = pressureTypes[Math.floor(Math.random() * pressureTypes.length)];
    const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];
    
    return {
      type: selectedType.type,
      message: message
    };
  }

  /**
   * 視覚効果設定
   */
  getVisualEffects(level) {
    const effects = {
      1: { shake: false, darken: false, blur: false },
      2: { shake: true, darken: false, blur: false },
      3: { shake: true, darken: true, blur: false },
      4: { shake: true, darken: true, blur: true, emergency: true }
    };
    
    return effects[level];
  }

  /**
   * 必要アクション設定
   */
  getRequiredAction(level) {
    const actions = {
      1: { waitTime: 10, requireConfirmation: false },
      2: { waitTime: 20, requireConfirmation: true },
      3: { waitTime: 30, requireConfirmation: true, requireReason: true },
      4: { waitTime: 60, requireConfirmation: true, requireReason: true, requireQuiz: true }
    };
    
    return actions[level];
  }

  /**
   * 特別演出効果
   */
  getSpecialEffects(data) {
    const effects = [];
    
    if (data.consecutiveIgnores >= 3) {
      effects.push({
        type: "guilt_trip",
        message: "もう3回も無視してる...うち悲しい😢",
        visual: "tear_animation"
      });
    }
    
    if (data.totalInterventions >= 20) {
      effects.push({
        type: "veteran_user",
        message: "あんた、うちのこと舐めてるでしょ？😏",
        visual: "glowing_eyes"
      });
    }
    
    return effects;
  }

  /**
   * 介入成功時の処理
   */
  onInterventionSuccess() {
    const data = this.getInterventionData();
    data.successfulBlocks += 1;
    data.consecutiveIgnores = 0; // リセット
    this.saveInterventionData(data);
    
    console.log("介入成功！ユーザーが冷静になりました");
  }

  /**
   * 介入失敗時の処理
   */
  onInterventionFailure() {
    const data = this.getInterventionData();
    data.failedBlocks += 1;
    data.consecutiveIgnores += 1;
    this.saveInterventionData(data);
    
    console.log("介入失敗...次回はもっと強くいきます");
  }

  /**
   * 介入統計を取得
   */
  getInterventionStats() {
    const data = this.getInterventionData();
    const successRate = data.totalInterventions > 0 ? 
      Math.round((data.successfulBlocks / data.totalInterventions) * 100) : 0;
    
    return {
      totalInterventions: data.totalInterventions,
      successRate: successRate,
      currentResistanceLevel: this.calculateResistanceLevel(),
      consecutiveIgnores: data.consecutiveIgnores,
      behaviorPattern: data.userBehaviorPattern
    };
  }
}

export const interventionService = new InterventionService();
