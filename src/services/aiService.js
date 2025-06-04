import OpenAI from "openai";
import { 
  getSystemPrompt, 
  getSampleConversations, 
  getDemoMessages, 
  getCategorySpecificMessages,
  detectCategory 
} from './ai/characterConfig';

/**
 * OpenAI APIクライアントのシングルトンインスタンス（リファクタリング版）
 * APIキーの初期化とレート制限対応
 * キャラクター設定を外部ファイルに分離して保守性を向上
 */
class AIService {
  constructor() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('⚠️ OpenAI API Keyが設定されていません。デモモードで動作します。');
      this.isDemo = true;
      this.openai = null;
    } else {
      this.isDemo = false;
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
    
    this.requestQueue = [];
    this.isProcessing = false;
    this.demoMessages = getDemoMessages();
    this.categoryMessages = getCategorySpecificMessages();
  }

  /**
   * 単一商品に対するAI分析を実行
   * @param {Object} item - カート商品オブジェクト
   * @returns {Promise<string>} AIの毒舌コメント
   */
  async analyzeItem(item) {
    // デモモードの場合はサンプルメッセージを返す
    if (this.isDemo) {
      return this.getDemoMessage(item);
    }

    try {
      const messages = [
        {
          role: "system",
          content: getSystemPrompt()
        },
        ...getSampleConversations(),
        {
          role: "user",
          content: `
            title: ${item.title}
            price: ${item.price}
            imageUrl: ${item.imageUrl}
            この商品を買おうか迷ってます。僕を罵ってください。
          `
        }
      ];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 150,
        temperature: 0.8
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI分析エラー:", error);
      return "アタシ、今ちょっと忙しいから後にして❤";
    }
  }

  /**
   * デモモード用のサンプルメッセージ生成（改善版）
   * 商品カテゴリを考慮したより適切なメッセージを生成
   * @param {Object} item - カート商品オブジェクト
   * @returns {string} デモ用毒舌メッセージ
   */
  getDemoMessage(item) {
    // 商品カテゴリを検出
    const category = detectCategory(item);
    
    // カテゴリ別メッセージがあれば使用
    if (this.categoryMessages[category]) {
      const categoryMsgs = this.categoryMessages[category];
      const msgFunc = categoryMsgs[item.title.length % categoryMsgs.length];
      return msgFunc(item);
    }
    
    // デフォルトメッセージを使用
    const msgFunc = this.demoMessages[item.title.length % this.demoMessages.length];
    return msgFunc(item);
  }

  /**
   * 複数商品を並列処理でAI分析（改善版）
   * パフォーマンス向上のためPromise.allを使用
   * エラーハンドリングを個別商品レベルで実施
   * @param {Array} cartItems - カート商品配列
   * @returns {Promise<Array>} AI応答配列
   */
  async analyzeCartItems(cartItems) {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }

    console.log(`${cartItems.length}個の商品をAI分析開始`);
    
    try {
      // 並列処理でパフォーマンス向上、個別エラーハンドリング
      const responses = await Promise.allSettled(
        cartItems.map(async (item, index) => {
          try {
            const response = await this.analyzeItem(item);
            console.log(`商品${index + 1}/${cartItems.length} 分析完了`);
            return response;
          } catch (error) {
            console.error(`商品${index + 1} 分析エラー:`, error);
            return "アタシ、この商品についてはちょっと分からないかも❤";
          }
        })
      );
      
      // 成功/失敗に関わらず結果を取得
      const finalResponses = responses.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`商品${index + 1} Promise rejected:`, result.reason);
          return "アタシ、エラーで困ってる❤ もう一回試して❤";
        }
      });
      
      console.log("AI分析完了:", finalResponses);
      return finalResponses;
    } catch (error) {
      console.error("カート分析エラー:", error);
      return cartItems.map(() => "アタシ、エラーで困ってる❤ もう一回試して❤");
    }
  }

  /**
   * APIレート制限対応（将来の拡張用）
   */
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      try {
        const result = await this.analyzeItem(request.item);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      
      // レート制限対応: 1秒待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.isProcessing = false;
  }

  /**
   * 統計情報取得
   */
  getStats() {
    return {
      isDemo: this.isDemo,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// シングルトンインスタンスをエクスポート
export const aiService = new AIService();

// 後方互換性のため、元のAI関数も維持
export async function AI(cartItems) {
  return aiService.analyzeCartItems(cartItems);
}
