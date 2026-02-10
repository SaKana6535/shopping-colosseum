'use client';

interface JudgeGaugeProps {
  score: number;
}

export default function JudgeGauge({ score }: JudgeGaugeProps) {
  // スコアに応じた色を決定
  const getColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (score: number) => {
    if (score < 40) return 'text-red-600 dark:text-red-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getLabel = (score: number) => {
    if (score < 30) return '購入非推奨';
    if (score < 40) return 'やや非推奨';
    if (score < 50) return 'どちらかといえば非推奨';
    if (score < 60) return 'どちらかといえば推奨';
    if (score < 70) return 'やや推奨';
    return '購入推奨';
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            購入推奨度
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI審判による総合評価
          </p>
        </div>
        <div className={`text-4xl font-black ${getTextColor(score)}`}>
          {score}%
        </div>
      </div>

      {/* ゲージバー */}
      <div className="relative mb-4">
        {/* 背景バー */}
        <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
          {/* 進捗バー */}
          <div
            className={`gauge-bar h-full ${getColor(score)} rounded-full shadow-lg relative overflow-hidden`}
            style={{ width: `${score}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* 中立点マーカー（50%） */}
        <div className="absolute top-0 bottom-0 w-1 bg-slate-400 dark:bg-slate-500 left-1/2 transform -translate-x-1/2">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow">
            中立
          </div>
        </div>
      </div>

      {/* ラベル */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-red-600 dark:text-red-400 font-medium">0% 非推奨</span>
        <span className={`font-bold text-base ${getTextColor(score)} bg-white dark:bg-slate-800 px-4 py-1 rounded-full shadow`}>
          {getLabel(score)}
        </span>
        <span className="text-green-600 dark:text-green-400 font-medium">100% 推奨</span>
      </div>
    </div>
  );
}
