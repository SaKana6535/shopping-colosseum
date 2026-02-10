'use client';

import { useState } from 'react';

interface ProductInputProps {
  onSubmit: (productUrl: string, userQuery: string) => void;
  isLoading: boolean;
  isDebating: boolean;
  onReset: () => void;
  productUrl?: string;
  userQuery?: string;
  onProductUrlChange?: (value: string) => void;
  onUserQueryChange?: (value: string) => void;
}

export default function ProductInput({ 
  onSubmit, 
  isLoading, 
  isDebating, 
  onReset,
  productUrl: externalProductUrl = '',
  userQuery: externalUserQuery = '',
  onProductUrlChange,
  onUserQueryChange
}: ProductInputProps) {
  const [internalProductUrl, setInternalProductUrl] = useState('');
  const [internalUserQuery, setInternalUserQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 外部から値が渡されている場合はそれを使用、そうでなければ内部状態を使用
  const productUrl = onProductUrlChange ? externalProductUrl : internalProductUrl;
  const userQuery = onUserQueryChange ? externalUserQuery : internalUserQuery;
  const setProductUrl = onProductUrlChange || setInternalProductUrl;
  const setUserQuery = onUserQueryChange || setInternalUserQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productUrl.trim() && userQuery.trim()) {
      onSubmit(productUrl, userQuery);
      setIsExpanded(false);
      // 値は保持する（リセットしない）
    }
  };

  const handleReset = () => {
    if (onProductUrlChange && onUserQueryChange) {
      onProductUrlChange('');
      onUserQueryChange('');
    } else {
      setInternalProductUrl('');
      setInternalUserQuery('');
    }
    setIsExpanded(false);
    onReset();
  };

  // 議論中のコンパクト表示
  if (isDebating && !isExpanded) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">商品:</span>
              <a 
                href={productUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="truncate text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                {productUrl}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">悩み:</span>
              <span className="truncate">{userQuery}</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="shrink-0 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            新規作成
          </button>
        </div>
      </div>
    );
  }

  // フルサイズの入力フォーム
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🛍️</span>
        議論を開始する
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div>
          <label 
            htmlFor="productUrl" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            商品URL
          </label>
          <input
            id="productUrl"
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label 
            htmlFor="userQuery" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            あなたの悩み
          </label>
          <textarea
            id="userQuery"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="この商品を買うべきか悩んでいます。価格は適正でしょうか？"
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none flex-1"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !productUrl.trim() || !userQuery.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? '議論を開始中...' : '🎭 議論を開始する'}
        </button>
      </form>
    </div>
  );
}
