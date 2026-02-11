'use client';

import { DebateTurn } from '@/types/debate';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalScore: number;
  turns: DebateTurn[];
  productUrl: string;
  userQuery: string;
}

export default function ResultModal({ isOpen, onClose, finalScore, turns, productUrl, userQuery }: ResultModalProps) {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600 dark:text-red-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return 'from-red-500 to-rose-500';
    if (score < 60) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-500';
  };

  const getRecommendation = (score: number) => {
    if (score < 30) return '購入非推奨';
    if (score < 50) return 'やや非推奨';
    if (score < 70) return 'やや推奨';
    return '購入推奨';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🎉 議論終了</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-white/90 text-sm">
            {turns.length}ターンの熱い議論が終了しました
          </p>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* 最終スコア */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">最終購入推奨度</div>
              <div className={`text-6xl font-black mb-3 ${getScoreColor(finalScore)}`}>
                {finalScore}%
              </div>
              <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${getScoreBg(finalScore)} text-white font-bold text-lg shadow-lg`}>
                {getRecommendation(finalScore)}
              </div>
            </div>
          </div>

          {/* 検討した商品 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">検討した商品</h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">商品URL</div>
              <a 
                href={productUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline break-all inline-flex items-center gap-1 mb-3"
              >
                {productUrl}
                <span className="text-xs">🔗</span>
              </a>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 mt-3">あなたの悩み</div>
              <div className="text-sm text-slate-800 dark:text-slate-200">{userQuery}</div>
            </div>
          </div>

          {/* 議論の推移 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">議論の推移</h3>
            <div className="space-y-3">
              {turns.map((turn) => (
                <div key={turn.turn_id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                        {turn.turn_id}
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">ターン {turn.turn_id}</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(turn.judge.score)}`}>
                      {turn.judge.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {turn.judge.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            新しい商品を検討する
          </button>
        </div>
      </div>
    </div>
  );
}
