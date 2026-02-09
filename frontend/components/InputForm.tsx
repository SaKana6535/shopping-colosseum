'use client';

import { useState } from 'react';

interface InputFormProps {
  onSubmit: (intervention?: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [intervention, setIntervention] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(intervention.trim() || undefined);
    setIntervention('');
    setShowInput(false);
  };

  const handleNextTurn = () => {
    onSubmit(undefined);
  };

  const suggestedInterventions = [
    '音質についてもっと詳しく',
    'デザインの評価を聞きたい',
    '長期的な耐久性について',
    '他の製品との比較',
    'コストパフォーマンスを重視',
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        次のアクション
      </h3>

      {!showInput ? (
        <div className="space-y-3">
          {/* 次のターンボタン */}
          <button
            onClick={handleNextTurn}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            次のターンへ進む
          </button>

          {/* 介入ボタン */}
          <button
            onClick={() => setShowInput(true)}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            議論に介入する
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="intervention" 
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              議論への指示
            </label>
            <textarea
              id="intervention"
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              placeholder="例: 音質についてもっと詳しく教えて"
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
              autoFocus
            />
          </div>

          {/* 提案 */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              提案:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedInterventions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setIntervention(suggestion)}
                  className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setIntervention('');
              }}
              className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              介入して次へ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
