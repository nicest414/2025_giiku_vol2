import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// リファクタリング後のコンポーネントをテスト
import { 
  LoadingSpinner, 
  ErrorDisplay, 
  ProgressBar,
  ProductCard,
  UserLevelDisplay 
} from '../components';

// テスト用のモックデータ
const mockProduct = {
  title: "テスト商品",
  price: "¥1,000",
  imageUrl: "/test-image.jpg"
};

const mockUserStats = {
  level: 5,
  title: "見習い節約家",
  exp: 1200,
  expToNext: 300,
  totalSaved: 15000,
  blockedCount: 10,
  achievementCount: 3
};

describe('リファクタリング後のコンポーネントテスト', () => {
  
  describe('LoadingSpinner', () => {
    test('デフォルトメッセージで表示される', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('カスタムメッセージで表示される', () => {
      render(<LoadingSpinner message="AI分析中..." />);
      expect(screen.getByText('AI分析中...')).toBeInTheDocument();
    });
  });

  describe('ErrorDisplay', () => {
    test('エラーメッセージが表示される', () => {
      render(<ErrorDisplay message="テストエラー" />);
      expect(screen.getByText('テストエラー')).toBeInTheDocument();
    });

    test('リトライボタンがクリックできる', () => {
      const mockRetry = jest.fn();
      render(<ErrorDisplay message="エラー" onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('再試行');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProgressBar', () => {
    test('プログレス値が正しく表示される', () => {
      render(<ProgressBar progress={50} />);
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 50%');
    });

    test('100%を超える値は100%に制限される', () => {
      render(<ProgressBar progress={150} />);
      const progressFill = document.querySelector('.progress-fill');
      expect(progressFill).toHaveStyle('width: 100%');
    });
  });

  describe('ProductCard', () => {
    test('商品情報が正しく表示される', () => {
      render(<ProductCard item={mockProduct} message="テストメッセージ" />);
      
      expect(screen.getByText('テスト商品')).toBeInTheDocument();
      expect(screen.getByText('¥1,000')).toBeInTheDocument();
      expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    });

    test('ローディング状態が正しく表示される', () => {
      render(<ProductCard item={mockProduct} isLoading={true} />);
      expect(screen.getByText('考え中...')).toBeInTheDocument();
    });
  });

  describe('UserLevelDisplay', () => {
    test('基本レベル情報が表示される', () => {
      render(<UserLevelDisplay userStats={mockUserStats} />);
      
      expect(screen.getByText('Lv.5')).toBeInTheDocument();
      expect(screen.getByText('見習い節約家')).toBeInTheDocument();
    });

    test('詳細情報が表示される', () => {
      render(<UserLevelDisplay userStats={mockUserStats} showDetails={true} />);
      
      expect(screen.getByText('EXP: 1200 (次まで300)')).toBeInTheDocument();
      expect(screen.getByText('¥15,000')).toBeInTheDocument();
      expect(screen.getByText('10回')).toBeInTheDocument();
    });

    test('統計データがnullの場合は何も表示されない', () => {
      const { container } = render(<UserLevelDisplay userStats={null} />);
      expect(container.firstChild).toBeNull();
    });
  });
});

// 統合テスト
describe('コンポーネント統合テスト', () => {
  test('複数のコンポーネントが正しく連携する', () => {
    render(
      <div>
        <UserLevelDisplay userStats={mockUserStats} showDetails={true} />
        <ProductCard item={mockProduct} message="テストメッセージ" />
        <ProgressBar progress={75} />
      </div>
    );

    // 全てのコンポーネントが正しく表示されることを確認
    expect(screen.getByText('Lv.5')).toBeInTheDocument();
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 75%');
  });
});