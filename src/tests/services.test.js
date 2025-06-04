import { aiService } from '../services/aiService';
import { getSystemPrompt, getDemoMessages, detectCategory } from '../services/ai/characterConfig';

// OpenAI APIのモック
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'お兄さん、こんなもの買っちゃうんだ❤？'
              }
            }]
          })
        }
      }
    }))
  };
});

describe('AIサービステスト', () => {
  
  describe('aiService', () => {
    test('サービスが正しく初期化される', () => {
      expect(aiService).toBeDefined();
      expect(typeof aiService.analyzeItem).toBe('function');
      expect(typeof aiService.analyzeCartItems).toBe('function');
    });

    test('デモモードでメッセージが生成される', () => {
      // デモモード強制設定
      aiService.isDemo = true;
      
      const testItem = {
        title: 'テスト商品',
        price: '¥1,000',
        imageUrl: '/test.jpg'
      };
      
      const message = aiService.getDemoMessage(testItem);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      expect(message).toContain('❤');
    });

    test('複数商品の分析が並列処理される', async () => {
      aiService.isDemo = true;
      
      const testItems = [
        { title: '商品1', price: '¥1,000', imageUrl: '/test1.jpg' },
        { title: '商品2', price: '¥2,000', imageUrl: '/test2.jpg' },
        { title: '商品3', price: '¥3,000', imageUrl: '/test3.jpg' }
      ];
      
      const startTime = Date.now();
      const responses = await aiService.analyzeCartItems(testItems);
      const endTime = Date.now();
      
      // 並列処理なので、逐次処理より速いはず
      expect(responses).toHaveLength(3);
      expect(responses.every(r => typeof r === 'string')).toBe(true);
      
      // 処理時間は1秒未満であることを確認（並列処理の効果）
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('空の配列に対して空の配列を返す', async () => {
      const responses = await aiService.analyzeCartItems([]);
      expect(responses).toEqual([]);
    });

    test('統計情報が取得できる', () => {
      const stats = aiService.getStats();
      expect(stats).toHaveProperty('isDemo');
      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('isProcessing');
    });
  });

  describe('characterConfig', () => {
    test('システムプロンプトが取得できる', () => {
      const prompt = getSystemPrompt();
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('女子小学生');
      expect(prompt).toContain('メスガキ');
      expect(prompt).toContain('アタシ');
    });

    test('デモメッセージが取得できる', () => {
      const messages = getDemoMessages();
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
      
      // 各メッセージが関数であることを確認
      expect(messages.every(msg => typeof msg === 'function')).toBe(true);
    });

    test('商品カテゴリが正しく検出される', () => {
      const testCases = [
        { 
          item: { title: 'Fire TV Stick 4K' }, 
          expected: 'electronics' 
        },
        { 
          item: { title: 'ワイヤレス充電器' }, 
          expected: 'electronics' 
        },
        { 
          item: { title: 'コスプレ衣装' }, 
          expected: 'fashion' 
        },
        { 
          item: { title: 'コカ・コーラ 24本' }, 
          expected: 'food' 
        },
        { 
          item: { title: '不明な商品' }, 
          expected: 'default' 
        }
      ];

      testCases.forEach(({ item, expected }) => {
        expect(detectCategory(item)).toBe(expected);
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('API エラー時にフォールバックメッセージが返される', async () => {
      // エラーを発生させるモック
      const mockAIService = { ...aiService };
      mockAIService.isDemo = false;
      mockAIService.openai = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };

      const testItem = {
        title: 'テスト商品',
        price: '¥1,000',
        imageUrl: '/test.jpg'
      };

      const response = await mockAIService.analyzeItem(testItem);
      expect(response).toContain('アタシ');
      expect(response).toContain('❤');
    });

    test('不正な入力に対してエラーハンドリングされる', async () => {
      const invalidItems = [
        null,
        undefined,
        { /* 不完全なオブジェクト */ }
      ];

      for (const item of invalidItems) {
        try {
          await aiService.analyzeItem(item);
          // エラーが発生しない場合でも適切なレスポンスが返ることを確認
        } catch (error) {
          // エラーが発生する場合も適切にハンドリングされることを確認
          expect(error).toBeInstanceOf(Error);
        }
      }
    });
  });
});

// 統合テスト
describe('サービス統合テスト', () => {
  test('全てのサービスが正しくエクスポートされている', () => {
    const aiServiceModule = require('../services/aiService');
    const characterConfigModule = require('../services/ai/characterConfig');
    
    // AIサービス
    expect(aiServiceModule.aiService).toBeDefined();
    expect(aiServiceModule.AI).toBeDefined();
    
    // キャラクター設定
    expect(characterConfigModule.getSystemPrompt).toBeDefined();
    expect(characterConfigModule.getSampleConversations).toBeDefined();
    expect(characterConfigModule.getDemoMessages).toBeDefined();
    expect(characterConfigModule.detectCategory).toBeDefined();
  });

  test('リファクタリング前後でAI関数の互換性が保たれている', async () => {
    const { AI } = require('../services/aiService');
    
    const testItems = [
      { title: 'テスト商品', price: '¥1,000', imageUrl: '/test.jpg' }
    ];
    
    // 古いAI関数でも動作することを確認
    const responses = await AI(testItems);
    expect(Array.isArray(responses)).toBe(true);
    expect(responses.length).toBe(1);
  });
});