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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          購入推奨度
        </h2>
        <div className={`text-3xl font-bold ${getTextColor(score)}`}>
          {score}%
        </div>
      </div>

      {/* ゲージバー */}
      <div className="relative">
        {/* 背景バー */}
        <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          {/* 進捗バー */}
          <div
            className={`gauge-bar h-full ${getColor(score)} rounded-full`}
            style={{ width: `${score}%` }}
          ></div>
        </div>

        {/* 中立点マーカー（50%） */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500"
          style={{ left: '50%' }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400">
            中立
          </div>
        </div>
      </div>

      {/* ラベル */}
      <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span>0% (買うな)</span>
        <span className={`font-semibold ${getTextColor(score)}`}>
          {getLabel(score)}
        </span>
        <span>100% (買え)</span>
      </div>
    </div>
  );
}
