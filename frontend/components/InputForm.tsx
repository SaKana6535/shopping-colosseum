'use client';

import { useState } from 'react';

interface InputFormProps {
  onSubmit: (intervention?: string) => void;
  onEnd?: () => void;
  currentTurn: number;
  maxTurns?: number;
}

export default function InputForm({ onSubmit, onEnd, currentTurn, maxTurns = 3 }: InputFormProps) {
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

  const isMaxTurnReached = currentTurn >= maxTurns;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-xl">💬</span>
        次のアクション
      </h3>

      {!showInput ? (
        <div className="space-y-3">
          {isMaxTurnReached ? (
            /* 3ターン後は終了か継続を選択 */
            <>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg mb-3">
                <p className="text-sm">
                  💡 {maxTurns}ターンが終了しました。議論を終了するか、継続するか選択してください。
                </p>
              </div>
              <button
                onClick={handleNextTurn}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                議論を継続する
              </button>
              <button
                onClick={() => setShowInput(true)}
                className="w-full border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-lg transition-all"
              >
                議論に介入してから継続
              </button>
              <button
                onClick={onEnd}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                議論を終了する
              </button>
            </>
          ) : (
            /* 3ターン未満は通常の進行 */
            <>
              <button
                onClick={handleNextTurn}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                次のターンへ進む ({currentTurn}/{maxTurns})
              </button>
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                議論に介入する
              </button>
            </>
          )}
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
