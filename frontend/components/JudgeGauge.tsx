'use client';

interface JudgeGaugeProps {
  score: number;
}

export default function JudgeGauge({ score }: JudgeGaugeProps) {
  // スコアに応じた色を決定
  const getColor = (score: number) => {
    if (score < 40) return 'bg-gradient-to-r from-red-500 to-rose-500';
    if (score < 60) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getTextColor = (score: number) => {
    if (score < 40) return 'text-red-600 dark:text-red-400';
    if (score < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getLabel = (score: number) => {
    if (score < 30) return '非推奨';
    if (score < 50) return 'やや非推奨';
    if (score < 70) return 'やや推奨';
    return '推奨';
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
      {/* コンパクトなヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          購入推奨度
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 ${getTextColor(score)}`}>
            {getLabel(score)}
          </span>
          <span className={`text-2xl font-black ${getTextColor(score)}`}>
            {score}%
          </span>
        </div>
      </div>

      {/* ゲージバー */}
      <div className="relative">
        {/* 背景バー */}
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
          {/* 進捗バー */}
          <div
            className={`h-full ${getColor(score)} rounded-full shadow-md transition-all duration-500 ease-out relative overflow-hidden`}
            style={{ width: `${score}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* 中立点マーカー（50%） */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400/60 dark:bg-slate-500/60 left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* 簡潔なラベル */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
