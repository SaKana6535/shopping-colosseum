'use client';

import { useState } from 'react';

interface ProductInputProps {
  onSubmit: (productUrl: string, userQuery: string) => void;
  isLoading: boolean;
}

export default function ProductInput({ onSubmit, isLoading }: ProductInputProps) {
  const [productUrl, setProductUrl] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productUrl.trim() && userQuery.trim()) {
      onSubmit(productUrl, userQuery);
    }
  };

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
