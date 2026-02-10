"""モックAIサービス - 実際のAI連携の前のテスト用"""

import random
from typing import List, Optional

from ..models import AgentMessage, JudgeResult, DebateTurn
from .ai_service import AIServiceBase


class MockAIService(AIServiceBase):
    """モックAIサービス - テンプレートベースの議論生成"""
    
    def __init__(self):
        self.agents_config = {
            'logical': {
                'name': 'Mr. Logic',
                'templates': [
                    'スペックを見る限り、この価格でこのCPU性能は破格です。ベンチマークスコアも競合製品を上回っています。',
                    'コストパフォーマンスの観点から分析すると、同価格帯の製品と比較して明確な優位性があります。',
                    '技術仕様を確認したところ、最新の規格に対応しており、将来性も高いと判断できます。',
                    '数値データに基づけば、この製品は合理的な選択肢と言えるでしょう。',
                ]
            },
            'emotional': {
                'name': 'Ms. Emotion',
                'templates': [
                    'でもデザインが野暮ったくない？毎日使うものだからテンション上がる見た目がいいな。',
                    'スペックは良くても、使っていてワクワクしないと意味がないと思うんです。',
                    'このカラーバリエーション、私の好みじゃないかも...もっとスタイリッシュなのがいいな。',
                    '見た目も大事！気分が上がる製品を選びたいです。',
                ]
            },
            'critical': {
                'name': 'Dr. Risk',
                'templates': [
                    '待ってください。排熱処理に問題があるというレビューが散見されます。夏場は危険かも。',
                    '保証期間が他社より短いのが気になります。長期的な信頼性に疑問があります。',
                    'サポート体制について調べましたが、ユーザーからの評価が芳しくありません。',
                    '価格が安いのには理由があるかもしれません。慎重に検討すべきです。',
                ]
            }
        }
    
    async def generate_debate(
        self,
        turn_id: int,
        product_url: str,
        user_query: str,
        user_intervention: Optional[str] = None,
        history: Optional[List[dict]] = None,
    ) -> DebateTurn:
        """議論を生成（モック）"""
        
        # エージェントのメッセージを生成
        debate_messages = []
        
        for role in ['logical', 'emotional', 'critical']:
            config = self.agents_config[role]
            
            # ユーザー介入がある場合は内容を反映
            if user_intervention and turn_id > 1:
                content = f"{random.choice(config['templates'])} {user_intervention}について補足すると、確かに重要なポイントですね。"
            else:
                content = random.choice(config['templates'])
            
            debate_messages.append(AgentMessage(
                agent_name=config['name'],
                role=role,
                content=content
            ))
        
        # 審判のスコアを生成
        judge_result = self._generate_judge_score(turn_id, user_intervention)
        
        return DebateTurn(
            turn_id=turn_id,
            debate=debate_messages,
            judge=judge_result
        )
    
    def _generate_judge_score(
        self,
        turn_id: int,
        user_intervention: Optional[str] = None
    ) -> JudgeResult:
        """審判のスコアを生成（モック）"""
        
        # ターンに応じてスコアを変動させる
        base_score = 50
        variation = random.randint(-15, 15)
        score = max(0, min(100, base_score + variation + (turn_id * 3)))
        
        # スコアに応じた理由を生成
        if score < 40:
            reason = "リスクや懸念点が多く指摘され、購入には慎重な姿勢が優勢です。"
        elif score < 60:
            reason = "メリットとデメリットが拮抗しており、判断が難しい状況です。"
        else:
            reason = "性能やコストパフォーマンスが高く評価され、購入に前向きな雰囲気です。"
        
        if user_intervention:
            reason += f" ユーザーからの「{user_intervention}」という指摘を受けて議論が深まりました。"
        
        return JudgeResult(score=score, reason=reason)
