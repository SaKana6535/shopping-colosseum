'use client';

import { AgentRole } from '@/types/debate';

interface AvatarIconProps {
  role: AgentRole;
  skinColor: string;
  className?: string;
}

export default function AvatarIcon({ role, skinColor, className = '' }: AvatarIconProps) {
  // エージェントごとの顔の特徴
  const renderFace = () => {
    switch (role) {
      case 'logical':
        // 論理派: メガネをかけた知的な顔
        return (
          <>
            {/* 眼鏡 */}
            <div className="absolute flex gap-2" style={{ top: '38%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2.5 h-2 border-2 border-slate-700 rounded-sm bg-white/20"></div>
              <div className="w-2.5 h-2 border-2 border-slate-700 rounded-sm bg-white/20"></div>
            </div>
            {/* 目 */}
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            </div>
            {/* 真剣な口 */}
            <div className="absolute w-3 h-0.5 bg-slate-700" style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'emotional':
        // 感情派: ハート型の目と笑顔
        return (
          <>
            {/* ハート目 */}
            <div className="absolute flex gap-2" style={{ top: '38%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="text-[8px]">❤️</div>
              <div className="text-[8px]">❤️</div>
            </div>
            {/* 笑顔 */}
            <div className="absolute w-3 h-1.5 border-b-2 border-slate-800 rounded-b-full" style={{ bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'critical':
        // 慎重派: 眉をひそめた警戒顔
        return (
          <>
            {/* 困った眉 */}
            <div className="absolute flex gap-2.5" style={{ top: '32%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2 h-0.5 bg-slate-700 rotate-12"></div>
              <div className="w-2 h-0.5 bg-slate-700 -rotate-12"></div>
            </div>
            {/* 目 */}
            <div className="absolute flex gap-2" style={{ top: '42%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            </div>
            {/* への字口 */}
            <div className="absolute w-2.5 h-1 border-t-2 border-slate-800 rounded-t-full" style={{ bottom: '25%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'cost_conscious':
        // コスパ派: 計算機的な目つき
        return (
          <>
            {/* 細い目（計算中） */}
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2 h-0.5 bg-slate-800 rounded"></div>
              <div className="w-2 h-0.5 bg-slate-800 rounded"></div>
            </div>
            {/* ¥マーク（小さく） */}
            <div className="absolute text-[6px] font-bold text-green-700" style={{ top: '48%', left: '50%', transform: 'translateX(-50%)' }}>¥</div>
            {/* ニヤリ */}
            <div className="absolute w-2.5 h-1 border-b border-slate-800" style={{ bottom: '26%', left: '50%', transform: 'translateX(-50%) rotate(-5deg)' }}></div>
          </>
        );
      
      case 'eco_friendly':
        // エコ派: 優しい目と穏やかな笑顔
        return (
          <>
            {/* 優しい目 */}
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
            </div>
            {/* 葉っぱマーク */}
            <div className="absolute text-[6px]" style={{ top: '25%', right: '25%' }}>🌿</div>
            {/* 穏やかな笑顔 */}
            <div className="absolute w-2.5 h-1 border-b-2 border-slate-700 rounded-b-lg" style={{ bottom: '26%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'aesthetic':
        // デザイン派: おしゃれな髪型と星の目
        return (
          <>
            {/* 前髪 */}
            <div className="absolute w-6 h-2 bg-slate-800 rounded-t-full" style={{ top: '15%', left: '50%', transform: 'translateX(-50%)' }}></div>
            {/* 星の目 */}
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="text-[8px]">✨</div>
              <div className="text-[8px]">✨</div>
            </div>
            {/* 上品な笑み */}
            <div className="absolute w-2 h-0.5 border-b border-slate-700 rounded-b" style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'practical':
        // 実用派: 真面目な表情
        return (
          <>
            {/* 真っ直ぐな眉 */}
            <div className="absolute flex gap-2.5" style={{ top: '34%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2 h-0.5 bg-slate-700"></div>
              <div className="w-2 h-0.5 bg-slate-700"></div>
            </div>
            {/* 目 */}
            <div className="absolute flex gap-2" style={{ top: '42%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            </div>
            {/* 一直線の口 */}
            <div className="absolute w-3 h-0.5 bg-slate-700" style={{ bottom: '26%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'data_driven':
        // データ派: データ眼鏡
        return (
          <>
            {/* 四角い眼鏡 */}
            <div className="absolute flex gap-1.5" style={{ top: '38%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2.5 h-2.5 border-2 border-blue-700 bg-blue-50/30"></div>
              <div className="w-2.5 h-2.5 border-2 border-blue-700 bg-blue-50/30"></div>
            </div>
            {/* 目 */}
            <div className="absolute flex gap-1.5" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
            </div>
            {/* 集中した口 */}
            <div className="absolute w-2 h-0.5 bg-slate-700" style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'trendy':
        // トレンド派: キラキラした表情
        return (
          <>
            {/* おしゃれな髪型 */}
            <div className="absolute w-5 h-2.5 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-t-full" style={{ top: '16%', left: '50%', transform: 'translateX(-50%)' }}></div>
            {/* キラキラ目 */}
            <div className="absolute flex gap-2" style={{ top: '42%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full relative">
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0 left-0"></div>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full relative">
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0 left-0"></div>
              </div>
            </div>
            {/* 笑顔 */}
            <div className="absolute w-3 h-1.5 border-b-2 border-slate-800 rounded-b-full" style={{ bottom: '24%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
      
      case 'social_proof':
        // 口コミ派: 社交的な笑顔
        return (
          <>
            {/* 丸い目 */}
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-2 h-2 bg-slate-800 rounded-full relative">
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0.5 left-0.5"></div>
              </div>
              <div className="w-2 h-2 bg-slate-800 rounded-full relative">
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-0.5 left-0.5"></div>
              </div>
            </div>
            {/* 大きな笑顔 */}
            <div className="absolute w-3.5 h-2 border-b-2 border-slate-800 rounded-b-full" style={{ bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}></div>
            {/* チークマーク */}
            <div className="absolute flex gap-4" style={{ top: '52%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1 h-1 bg-pink-300 rounded-full opacity-60"></div>
              <div className="w-1 h-1 bg-pink-300 rounded-full opacity-60"></div>
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="absolute flex gap-2" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            </div>
            <div className="absolute w-2 h-1 border-b-2 border-slate-800 rounded-b-full" style={{ bottom: '25%', left: '50%', transform: 'translateX(-50%)' }}></div>
          </>
        );
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* 頭部 */}
      <div className={`absolute w-7 h-7 ${skinColor} rounded-full shadow-lg`} style={{
        top: '20%',
        background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 60%)`
      }}>
        {renderFace()}
      </div>
      
      {/* 首 */}
      <div className={`absolute w-3 h-2 ${skinColor} rounded-sm`} style={{ top: '55%', opacity: 0.9 }}></div>
      
      {/* 体 */}
      <div className="absolute w-8 h-4 bg-white rounded-lg shadow-md" style={{
        top: '65%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
      }}></div>
    </div>
  );
}
