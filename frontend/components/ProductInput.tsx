'use client';

import { useState } from 'react';

interface ProductInputProps {
  onSubmit: (productUrl: string, userQuery: string) => void;
  isLoading: boolean;
  isDebating: boolean;
  onReset: () => void;
}

export default function ProductInput({ onSubmit, isLoading, isDebating, onReset }: ProductInputProps) {
  const [productUrl, setProductUrl] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productUrl.trim() && userQuery.trim()) {
      onSubmit(productUrl, userQuery);
      setIsExpanded(false);
    }
  };

  const handleReset = () => {
    setProductUrl('');
    setUserQuery('');
    setIsExpanded(false);
    onReset();
  };

  // 議論中のコンパクト表示
  if (isDebating && !isExpanded) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">商品:</span>
              <span className="truncate">{productUrl}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">悩み:</span>
              <span className="truncate">{userQuery}</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="shrink-0 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            新しい議論
          </button>
        </div>
      </div>
    );
  }

  // フルサイズの入力フォーム
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        議論を開始する
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="productUrl" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            商品URL
          </label>
          <input
            id="productUrl"
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label 
            htmlFor="userQuery" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            あなたの悩み
          </label>
          <textarea
            id="userQuery"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="この商品を買うべきか悩んでいます。価格は適正でしょうか？"
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !productUrl.trim() || !userQuery.trim()}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? '議論を開始中...' : '議論を開始する'}
        </button>
      </form>
    </div>
  );
}
