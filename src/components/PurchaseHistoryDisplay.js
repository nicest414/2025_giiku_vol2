import React, { useState, useEffect } from 'react';
import { purchaseHistoryService } from '../services/purchaseHistoryService';

/**
 * 購入履歴表示コンポーネント
 * 過去の買い物データと統計情報を表示
 */
export const PurchaseHistoryDisplay = () => {
  const [historyData, setHistoryData] = useState(null);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'history' | 'regrets'

  useEffect(() => {
    // 📊 履歴データを読み込み
    const stats = purchaseHistoryService.getStats();
    const history = purchaseHistoryService.getHistory();
    const regrets = purchaseHistoryService.getRegretItems();
    
    setHistoryData({
      stats,
      history: history.slice(0, 5), // 最新5件のみ表示
      regrets
    });
    
    console.log('📊 購入履歴データ読み込み:', { stats, history, regrets });
  }, []);

  if (!historyData) {
    return (
      <div className="purchase-history-loading">
        <div className="loading-icon">📊</div>
        <p>履歴を読み込み中...</p>
      </div>
    );
  }

  const { stats, history, regrets } = historyData;

  /**
   * タブの切り替え処理
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  /**
   * 金額のフォーマット
   */
  const formatAmount = (amount) => {
    return `¥${amount.toLocaleString()}`;
  };

  /**
   * 日付のフォーマット
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="purchase-history">
      <div className="purchase-history-header">
        <h3>💰 お買い物履歴</h3>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => handleTabChange('stats')}
          >
            📊 統計
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => handleTabChange('history')}
          >
            📋 履歴
          </button>
          <button 
            className={activeTab === 'regrets' ? 'active' : ''}
            onClick={() => handleTabChange('regrets')}
          >
            😭 後悔リスト
          </button>
        </div>
      </div>

      <div className="purchase-history-content">
        {activeTab === 'stats' && (
          <div className="stats-panel">
            <div className="stat-cards">
              <div className="stat-card blocked">
                <div className="stat-icon">🛡️</div>
                <div className="stat-info">
                  <h4>阻止した買い物</h4>
                  <div className="stat-value">{stats.totalBlocked}回</div>
                  <div className="stat-amount">{formatAmount(stats.totalSavedAmount)}</div>
                </div>
              </div>
              
              <div className="stat-card purchased">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h4>実際の購入</h4>
                  <div className="stat-value">{stats.totalPurchased}回</div>
                  <div className="stat-amount">{formatAmount(stats.totalSpentAmount)}</div>
                </div>
              </div>
              
              <div className="stat-card regret">
                <div className="stat-icon">😭</div>
                <div className="stat-info">
                  <h4>後悔した買い物</h4>
                  <div className="stat-value">{regrets.length}個</div>
                  <div className="stat-rate">{stats.regretRate}%</div>
                </div>
              </div>
            </div>

            {/* カテゴリ別統計 */}
            <div className="category-stats">
              <h4>📦 カテゴリ別</h4>
              <div className="category-list">
                {Object.entries(stats.categoryStats).map(([category, data]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <div className="category-data">
                      <span className="category-count">{data.count}回</span>
                      <span className="category-amount">{formatAmount(data.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-panel">
            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>まだ履歴がないよ！<br />買い物を阻止したら記録されるからね〜💕</p>
                </div>
              ) : (
                history.map(record => (
                  <div key={record.id} className={`history-item ${record.type}`}>
                    <div className="history-header">
                      <span className="history-type">
                        {record.type === 'blocked' ? '🛡️ 阻止' : '🛒 購入'}
                      </span>
                      <span className="history-date">{formatDate(record.timestamp)}</span>
                    </div>
                    <div className="history-amount">
                      {formatAmount(record.totalAmount)}
                    </div>
                    <div className="history-items">
                      {record.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="history-item-name">
                          {item.title.length > 30 ? 
                            `${item.title.substring(0, 30)}...` : 
                            item.title
                          }
                        </div>
                      ))}
                      {record.items.length > 2 && (
                        <div className="history-more">
                          他{record.items.length - 2}件
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'regrets' && (
          <div className="regrets-panel">
            {regrets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">😊</div>
                <p>後悔してる買い物はないみたい！<br />いい感じじゃん〜✨</p>
              </div>
            ) : (
              <div className="regrets-list">
                <p className="regrets-intro">
                  😭 後悔した買い物たち... 
                  <br />これを見て次は気をつけよう！
                </p>
                {regrets.map((item, index) => (
                  <div key={index} className="regret-item">
                    <div className="regret-info">
                      <h4>{item.title}</h4>
                      <div className="regret-details">
                        <span className="regret-price">{item.price}</span>
                        <span className="regret-date">{formatDate(item.addedAt)}</span>
                      </div>
                    </div>
                    <div className="regret-reason">
                      💭 {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
