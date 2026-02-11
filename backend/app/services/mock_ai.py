"""モックAIサービス - 実際のAI連携の前のテスト用"""

import random
from typing import List, Optional

from ..models import AgentMessage, JudgeResult, DebateTurn
from .ai_service import AIServiceBase


# エージェントの定義（レビューモード用テンプレート）
AGENT_CONFIGS = {
    "logical": {
        "name": "Mr. Logic",
        "templates": [
            'スペックを見る限り、この価格でこのCPU性能は破格です。ベンチマークスコアも競合製品を上回っています。',
            'コストパフォーマンスの観点から分析すると、同価格帯の製品と比較して明確な優位性があります。',
            '技術仕様を確認したところ、最新の規格に対応しており、将来性も高いと判断できます。',
            '数値データに基づけば、この製品は合理的な選択肢と言えるでしょう。',
        ],
        "discussion_templates": [
            '{target}の意見も理解できますが、スペック面のデータを見ると、この価格帯では明確な優位性があります。',
            '{target}が指摘した点は感情論です。客観的なベンチマークスコアで判断すべきでしょう。',
            '{target}の懸念には一理ありますが、数値データに基づけば、リスクは許容範囲内です。',
        ],
    },
    "emotional": {
        "name": "Ms. Emotion",
        "templates": [
            'でもデザインが野暮ったくない？毎日使うものだからテンション上がる見た目がいいな。',
            'スペックは良くても、使っていてワクワクしないと意味がないと思うんです。',
            'このカラーバリエーション、私の好みじゃないかも...もっとスタイリッシュなのがいいな。',
            '見た目も大事！気分が上がる製品を選びたいです。',
        ],
        "discussion_templates": [
            '{target}はデータばかり見てるけど、毎日使うものだからワクワク感も大事じゃない？',
            '{target}の分析は正しいかもしれないけど、心が躍らない製品を買っても後悔しそう。',
            '{target}、リスクばかり気にしてたら何も買えないよ！直感を信じることも大切！',
        ],
    },
    "critical": {
        "name": "Dr. Risk",
        "templates": [
            '待ってください。排熱処理に問題があるというレビューが散見されます。夏場は危険かも。',
            '保証期間が他社より短いのが気になります。長期的な信頼性に疑問があります。',
            'サポート体制について調べましたが、ユーザーからの評価が芳しくありません。',
            '価格が安いのには理由があるかもしれません。慎重に検討すべきです。',
        ],
        "discussion_templates": [
            '{target}の楽観的な見方には賛同しかねます。レビューを見ると、耐久性に懸念があります。',
            '{target}が言うほど完璧ではありません。保証期間の短さは重大なリスクです。',
            '{target}の指摘した利点は認めますが、長期的なリスクを無視すべきではありません。',
        ],
    },
    "cost_conscious": {
        "name": "Mr. Budget",
        "templates": [
            'この価格なら他の選択肢も検討すべきです。同じ予算でもっと良いものが買えるかも。',
            '費用対効果を考えると、もう少し安い製品でも十分な性能が得られますよ。',
            '長期的なコストも考慮しましょう。初期投資だけでなく、維持費や消耗品代も重要です。',
            'セールを待てば、もっとお得に買えるかもしれません。急いで買う必要はありますか？',
        ],
        "discussion_templates": [
            '{target}はデザインを重視していますが、同等のデザインで半額の製品もありますよ。',
            '{target}の言うスペックは魅力的ですが、コスパで考えると他に良い選択肢があります。',
            '{target}、その機能に本当にこの値段の価値がありますか？冷静に計算してみましょう。',
        ],
    },
    "eco_friendly": {
        "name": "Ms. Green",
        "templates": [
            '環境への影響が気になります。この製品は省エネ性能が低いですね。',
            'サステナビリティの観点から、もっとエコな代替品を検討してはいかがでしょうか。',
            '製造過程や素材の環境負荷も考慮すべきです。リサイクル素材を使った製品もありますよ。',
            '長く使える耐久性があれば、結果的に環境にも優しい選択になります。',
        ],
        "discussion_templates": [
            '{target}はコスパを重視していますが、環境コストも含めて考えるべきではないでしょうか。',
            '{target}の意見も分かりますが、サステナビリティの観点が欠けています。',
            '{target}、長く使えるかどうかは環境にも直結します。耐久性も含めて考えましょう。',
        ],
    },
    "aesthetic": {
        "name": "Ms. Design",
        "templates": [
            'デザインの完成度が素晴らしいですね！インテリアとしても映えます。',
            '色使いやフォルムが洗練されていて、所有する喜びを感じられそうです。',
            '美的価値も重要な判断基準です。毎日目にするものだからこそ、心地よいデザインを。',
            '質感や細部のディテールまでこだわりを感じます。デザインで選ぶのもありですね。',
        ],
        "discussion_templates": [
            '{target}はスペック重視ですが、このフォルムの美しさも立派な価値ですよ。',
            '{target}の指摘するリスクは理解しますが、デザインの完成度はそれを補って余りあります。',
            '{target}、コスパだけで選んでデザインに妥協したら、毎日の満足度が下がりませんか？',
        ],
    },
    "practical": {
        "name": "Mr. Practical",
        "templates": [
            '実際の使い勝手はどうでしょう？スペックは良くても、使いにくければ意味がありません。',
            'メンテナンスのしやすさも重要です。お手入れが大変だと、結局使わなくなりますよ。',
            '日常的な使用シーンを想像してみてください。本当に便利に使えそうですか？',
            '実用性を最優先に考えると、もっとシンプルで使いやすい製品があるかもしれません。',
        ],
        "discussion_templates": [
            '{target}はデザインを褒めていますが、実際に毎日使うとなると使い勝手の方が重要です。',
            '{target}の言うデータは参考になりますが、実際の使用感はまた別の話ですよ。',
            '{target}、トレンドに流されず、実際の使用シーンで考えてみませんか？',
        ],
    },
    "data_driven": {
        "name": "Dr. Data",
        "templates": [
            'レビューデータを分析すると、満足度は平均78%で業界標準レベルです。',
            '統計的に見て、この製品カテゴリーでは故障率が高めの傾向があります。',
            '過去6ヶ月の価格推移を見ると、今が買い時とは言えない状況です。',
            'ユーザーレビューの感情分析では、ポジティブな意見が65%を占めています。',
        ],
        "discussion_templates": [
            '{target}の主観的な評価は分かりますが、データで見ると満足度は平均78%です。',
            '{target}が懸念するリスクについて、統計的には故障率は業界平均以下です。',
            '{target}の感覚的な評価を数値化すると、実はそこまで悪くないデータが出ています。',
        ],
    },
    "trendy": {
        "name": "Ms. Trend",
        "templates": [
            '最新トレンドを見ると、今はこのタイプより別のモデルが人気ですよ。',
            'SNSでの話題性も価値の一つです。この製品、結構バズってますね！',
            '流行の観点から見ると、少し古いデザインかもしれません。',
            'インフルエンサーたちも注目しているので、今が買い時かもしれませんね。',
        ],
        "discussion_templates": [
            '{target}はスペック重視ですが、今のトレンドを考えると、もっと人気のモデルがありますよ。',
            '{target}、SNSでの話題性も考慮すべきです。この製品、結構バズってます！',
            '{target}の慎重な姿勢は分かりますが、流行に乗り遅れるリスクもありますよ？',
        ],
    },
    "social_proof": {
        "name": "Mr. Social",
        "templates": [
            '購入者レビューを見ると、多くの人が満足しているようです。',
            '口コミでは「期待以上だった」という声が多いですね。信頼できそうです。',
            '実際のユーザー体験から学べることが多いです。レビューを詳しく確認しましょう。',
            '評価が高い製品ですが、一部で不満の声もあるので注意が必要です。',
        ],
        "discussion_templates": [
            '{target}のデータ分析は参考になりますが、実際の購入者の声も聞いてみましょう。',
            '{target}が心配するリスクについて、口コミでは「問題なし」との声が多数です。',
            '{target}の理論は分かりますが、実際に使った人の体験談の方が参考になりますよ。',
        ],
    },
}


class MockAIService(AIServiceBase):
    """モックAIサービス - テンプレートベースの議論生成"""

    async def generate_debate(
        self,
        turn_id: int,
        product_url: str,
        user_query: str,
        selected_agents: Optional[List[str]] = None,
        user_intervention: Optional[str] = None,
        history: Optional[List[dict]] = None,
        debate_mode: str = "discussion",
    ) -> DebateTurn:
        """議論を生成（モック）"""

        if selected_agents is None:
            selected_agents = ['logical', 'emotional', 'critical']

        # エージェントのメッセージを生成
        debate_messages = []

        for idx, role in enumerate(selected_agents):
            config = AGENT_CONFIGS.get(role)
            if not config:
                continue

            # ディスカッションモードかつターン2以降は他エージェントに言及
            if debate_mode == "discussion" and turn_id > 1 and len(selected_agents) > 1:
                # 自分以外のエージェントからランダムに1人選ぶ
                other_agents = [r for r in selected_agents if r != role]
                target_role = random.choice(other_agents)
                target_config = AGENT_CONFIGS.get(target_role)
                target_name = target_config["name"] if target_config else "他のエージェント"

                discussion_templates = config.get("discussion_templates", config["templates"])
                template = random.choice(discussion_templates)
                content = template.format(target=target_name)
            else:
                content = random.choice(config['templates'])

            # ユーザー介入がある場合は内容を反映
            if user_intervention and turn_id > 1:
                content += f" {user_intervention}について補足すると、確かに重要なポイントですね。"

            debate_messages.append(AgentMessage(
                agent_name=config['name'],
                role=role,
                content=content,
            ))

        # 審判のスコアを生成
        judge_result = self._generate_judge_score(turn_id, user_intervention)

        return DebateTurn(
            turn_id=turn_id,
            debate=debate_messages,
            judge=judge_result,
        )

    def _generate_judge_score(
        self,
        turn_id: int,
        user_intervention: Optional[str] = None,
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
