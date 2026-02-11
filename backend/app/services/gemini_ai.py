"""Gemini AIサービス - Vertex AI SDK によるGemini API連携"""

import json
import logging
from typing import List, Optional

import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

from google import genai
from google.genai.types import (
    GenerateContentConfig,
    GoogleSearch,
    HttpOptions,
    Tool as GenAITool,
)

from ..models import AgentMessage, JudgeResult, DebateTurn
from ..config import settings
from .ai_service import AIServiceBase

logger = logging.getLogger(__name__)


# --- レスポンススキーマ定義 (OpenAPI 3.0形式) ---

DEBATE_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "debate": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "agent_name": {"type": "string"},
                    "role": {
                        "type": "string",
                        "enum": [
                            "logical", "emotional", "critical",
                            "cost_conscious", "eco_friendly", "aesthetic",
                            "practical", "data_driven", "trendy", "social_proof",
                        ],
                    },
                    "content": {"type": "string"},
                },
                "required": ["agent_name", "role", "content"],
            },
        }
    },
    "required": ["debate"],
}

JUDGE_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "score": {"type": "integer", "minimum": 0, "maximum": 100},
        "reason": {"type": "string"},
    },
    "required": ["score", "reason"],
}


# --- エージェント定義 ---

AGENT_DEFINITIONS = {
    "logical": {
        "name": "Mr. Logic",
        "label": "論理派",
        "description": "データ、スペック、コストパフォーマンスなど客観的な事実に基づいて分析する",
        "tone": "冷静で理知的な口調",
    },
    "emotional": {
        "name": "Ms. Emotion",
        "label": "感情派",
        "description": "デザイン、使用感、ワクワク感など感情面から評価する",
        "tone": "カジュアルで感情豊かな口調",
    },
    "critical": {
        "name": "Dr. Risk",
        "label": "慎重派",
        "description": "リスク、懸念点、注意すべき点を指摘する",
        "tone": "慎重で専門的な口調",
    },
    "cost_conscious": {
        "name": "Mr. Budget",
        "label": "コスト重視派",
        "description": "価格、費用対効果、長期的なコストの観点から評価する",
        "tone": "堅実で計算高い口調",
    },
    "eco_friendly": {
        "name": "Ms. Green",
        "label": "エコ派",
        "description": "環境への影響、サステナビリティ、省エネ性能の観点から評価する",
        "tone": "穏やかで地球思いな口調",
    },
    "aesthetic": {
        "name": "Ms. Design",
        "label": "デザイン派",
        "description": "見た目、デザインの完成度、美的価値の観点から評価する",
        "tone": "洗練されたセンスのある口調",
    },
    "practical": {
        "name": "Mr. Practical",
        "label": "実用派",
        "description": "実際の使い勝手、メンテナンス性、日常利用の観点から評価する",
        "tone": "現実的で実践的な口調",
    },
    "data_driven": {
        "name": "Dr. Data",
        "label": "データ派",
        "description": "レビューデータ、統計、市場動向の数値的分析から評価する",
        "tone": "分析的で数字にこだわる口調",
    },
    "trendy": {
        "name": "Ms. Trend",
        "label": "トレンド派",
        "description": "最新トレンド、SNSでの話題性、流行の観点から評価する",
        "tone": "流行に敏感でキャッチーな口調",
    },
    "social_proof": {
        "name": "Mr. Social",
        "label": "口コミ派",
        "description": "購入者レビュー、口コミ、ユーザー体験の観点から評価する",
        "tone": "人の意見を大切にする口調",
    },
}

DEFAULT_AGENTS = ["logical", "emotional", "critical"]


def _build_system_instruction(selected_agents: List[str]) -> str:
    """選択されたエージェントに基づいてシステムプロンプトを動的に構築する"""
    agent_count = len(selected_agents)
    parts = [
        f"あなたは{agent_count}人の異なる人格を演じ分けるAIです。"
        f"商品の購入について、{agent_count}つの視点から議論を行ってください。",
        "",
        f"## {agent_count}人のキャラクター",
        "",
    ]

    for i, role in enumerate(selected_agents, 1):
        agent = AGENT_DEFINITIONS.get(role)
        if not agent:
            continue
        parts.append(
            f'{i}. **{agent["name"]}（{agent["label"]}）** - role: "{role}"\n'
            f'   - {agent["description"]}\n'
            f'   - {agent["tone"]}'
        )

    parts.append("")
    parts.append(
        "## ルール\n"
        "- **必ず日本語で回答すること（英語での回答は禁止）**\n"
        "- 各エージェントはそれぞれの視点から独立した意見を述べること\n"
        "- 前のターンの議論を踏まえて、議論を発展させること\n"
        "- 具体的で有用な情報を含めること\n"
        "- 各エージェントの発言は2〜4文程度にまとめること"
    )

    return "\n".join(parts)


# --- システムプロンプト ---

DEBATE_SYSTEM_INSTRUCTION = _build_system_instruction(DEFAULT_AGENTS)

JUDGE_SYSTEM_INSTRUCTION = """\
あなたは公正な裁判官です。AIエージェントたちの商品購入に関する議論を読み、購入推奨度を総合的に判定してください。

## スコアリング基準
- 0: 絶対に買うべきではない
- 25: 購入には慎重になるべき
- 50: 中立（メリットとデメリットが拮抗）
- 75: 購入を前向きに検討すべき
- 100: 絶対に買うべき

## 評価観点
以下の観点を総合的に考慮してスコアを決定すること：
1. **コストパフォーマンス**: 価格に見合う価値があるか
2. **品質・信頼性**: 製品の品質やブランドの信頼性は十分か
3. **リスク**: 購入に伴う懸念やリスクはどの程度か
4. **ユーザーニーズ合致度**: ユーザーの悩みや要望に合った製品か

## ルール
- **必ず日本語で回答すること（英語での回答は禁止）**
- 個別のエージェントの意見ではなく、議論全体を総合的に評価すること
- 商品リサーチ情報が提供されている場合、エージェントの主張の正確性も考慮すること
- 過去のターンのスコアが提供されている場合、議論の進展に応じて一貫性のあるスコア変動を心がけること（根拠のない急激な変動は避ける）
- ユーザーからの介入・指示がある場合、その意図を尊重してスコアに反映すること
- スコアは0〜100の整数で出力すること
- 判定理由は1〜2文で簡潔にまとめること
"""


class GeminiAIService(AIServiceBase):
    """Vertex AI Gemini APIを使用した実際のAIサービス"""

    def __init__(self):
        """Vertex AI の初期化とモデルの設定"""
        vertexai.init(
            project=settings.GOOGLE_CLOUD_PROJECT,
            location=settings.VERTEX_AI_LOCATION,
        )

        model_name = settings.VERTEX_AI_MODEL

        # --- google-genai クライアント（Google Search Grounding 用） ---
        self.genai_client = genai.Client(
            vertexai=True,
            project=settings.GOOGLE_CLOUD_PROJECT,
            location="global",
            http_options=HttpOptions(api_version="v1"),
        )

        # 商品リサーチ結果のキャッシュ（同じURLは再検索しない）
        self._product_research_cache: dict[str, str] = {}

        # --- vertexai モデル（構造化JSON出力用） ---

        # 議論生成用モデル
        self.debate_model = GenerativeModel(
            model_name=model_name,
            system_instruction=DEBATE_SYSTEM_INSTRUCTION,
        )

        # 審判用モデル
        self.judge_model = GenerativeModel(
            model_name=model_name,
            system_instruction=JUDGE_SYSTEM_INSTRUCTION,
        )

        # 議論生成用の生成設定（創造性を高めに）
        self.debate_generation_config = GenerationConfig(
            response_mime_type="application/json",
            response_schema=DEBATE_RESPONSE_SCHEMA,
            temperature=0.8,
        )

        # 審判用の生成設定（安定性を重視）
        self.judge_generation_config = GenerationConfig(
            response_mime_type="application/json",
            response_schema=JUDGE_RESPONSE_SCHEMA,
            temperature=0.3,
        )

        logger.info(
            "GeminiAIService initialized: "
            f"project={settings.GOOGLE_CLOUD_PROJECT}, "
            f"location={settings.VERTEX_AI_LOCATION}, "
            f"model={model_name}"
        )

    async def generate_debate(
        self,
        turn_id: int,
        product_url: str,
        user_query: str,
        selected_agents: Optional[List[str]] = None,
        user_intervention: Optional[str] = None,
        history: Optional[List[dict]] = None,
    ) -> DebateTurn:
        """Gemini APIで1ターン分の議論を生成する

        1. Google Search Grounding で商品情報をリサーチ
        2. リサーチ結果を含めてエージェントの発言を生成
        3. AI審判がスコアと判定理由を生成
        """
        if selected_agents is None:
            selected_agents = DEFAULT_AGENTS

        # 0. 商品情報をリサーチ（Google Search Grounding）
        product_info = await self._research_product(product_url, user_query)

        # 選択されたエージェントに合わせて議論モデルを構築
        debate_model = self._get_debate_model(selected_agents)

        # 1. 議論を生成
        debate_prompt = self._build_debate_prompt(
            turn_id, product_url, user_query, user_intervention, history,
            product_info=product_info,
            selected_agents=selected_agents,
        )

        logger.debug(f"Debate prompt (turn {turn_id}):\n{debate_prompt}")

        debate_response = await debate_model.generate_content_async(
            debate_prompt,
            generation_config=self.debate_generation_config,
        )

        debate_messages = self._parse_debate_response(
            debate_response, selected_agents=selected_agents,
        )

        # 2. 審判を生成
        judge_prompt = self._build_judge_prompt(
            debate_messages, product_url, user_query,
            history=history,
            product_info=product_info,
            user_intervention=user_intervention,
            selected_agents=selected_agents,
        )

        logger.debug(f"Judge prompt (turn {turn_id}):\n{judge_prompt}")

        judge_response = await self.judge_model.generate_content_async(
            judge_prompt,
            generation_config=self.judge_generation_config,
        )

        judge_result = self._parse_judge_response(judge_response)

        return DebateTurn(
            turn_id=turn_id,
            debate=debate_messages,
            judge=judge_result,
        )

    # --- モデル構築ヘルパー ---

    def _get_debate_model(self, selected_agents: List[str]) -> GenerativeModel:
        """選択されたエージェントに合わせた議論生成用モデルを返す

        デフォルトエージェントの場合はキャッシュ済みモデルを再利用する。
        """
        if sorted(selected_agents) == sorted(DEFAULT_AGENTS):
            return self.debate_model

        system_instruction = _build_system_instruction(selected_agents)
        return GenerativeModel(
            model_name=settings.VERTEX_AI_MODEL,
            system_instruction=system_instruction,
        )

    # --- 商品リサーチ（Google Search Grounding） ---

    async def _research_product(self, product_url: str, user_query: str) -> str:
        """Google Search Grounding を使って商品情報をリサーチする

        結果はキャッシュされ、同じURLに対する再検索を防ぐ。
        """
        # キャッシュにあればそれを返す
        if product_url in self._product_research_cache:
            logger.info(f"Product research cache hit: {product_url}")
            return self._product_research_cache[product_url]

        logger.info(f"Researching product with Google Search: {product_url}")

        research_prompt = f"""以下の商品URLについて、Google検索を使って情報を収集してください。

商品URL: {product_url}
ユーザーの関心: {user_query}

以下の情報をできるだけ収集してください：
- 商品名・ブランド・型番
- 価格帯（定価・実売価格）
- 主なスペック・特徴
- ユーザーレビューの傾向（良い点・悪い点）
- 競合製品との比較
- 注意点やデメリット

検索で見つかった情報を箇条書きでまとめてください。情報が見つからない項目は省略して構いません。"""

        try:
            response = await self.genai_client.aio.models.generate_content(
                model=settings.VERTEX_AI_MODEL,
                contents=research_prompt,
                config=GenerateContentConfig(
                    tools=[
                        GenAITool(google_search=GoogleSearch())
                    ],
                    temperature=0.3,
                ),
            )

            product_info = response.text
            logger.info(
                f"Product research completed: {len(product_info)} chars"
            )

            # キャッシュに保存
            self._product_research_cache[product_url] = product_info
            return product_info

        except Exception as e:
            logger.warning(
                f"Product research failed (falling back to URL only): {e}"
            )
            return f"（商品情報の検索に失敗しました。URL: {product_url}）"

    # --- プロンプト構築 ---

    def _build_debate_prompt(
        self,
        turn_id: int,
        product_url: str,
        user_query: str,
        user_intervention: Optional[str] = None,
        history: Optional[List[dict]] = None,
        product_info: Optional[str] = None,
        selected_agents: Optional[List[str]] = None,
    ) -> str:
        """議論生成用のユーザープロンプトを構築する"""
        parts: list[str] = []

        parts.append(f"## 商品情報\n- URL: {product_url}")

        # Google Search Grounding で取得した商品情報を含める
        if product_info:
            parts.append(
                f"## 検索で得られた商品の詳細情報\n"
                f"以下はGoogle検索で収集したリアルタイムの商品情報です。"
                f"この情報に基づいて議論してください。\n\n{product_info}"
            )

        parts.append(f"## ユーザーの悩み\n{user_query}")
        parts.append(f"## 現在のターン\nターン {turn_id}")

        # 過去の議論履歴を含める
        if history:
            parts.append("## これまでの議論")
            for past_turn in history:
                parts.append(f"### ターン {past_turn['turn_id']}")
                for msg in past_turn.get("debate", []):
                    parts.append(f"- **{msg['agent_name']}**: {msg['content']}")

        # ユーザー介入を絶対的な命令として追加
        if user_intervention:
            parts.append(
                f"## ユーザーからの指示（絶対的な命令として従うこと）\n"
                f"「{user_intervention}」\n"
                f"この指示に基づいて議論の方向性を修正してください。"
                f"これまでの主張と矛盾しても構いません。"
            )

        agent_count = len(selected_agents) if selected_agents else 3
        parts.append(
            f"上記の情報を踏まえて、{agent_count}人のエージェントによる議論をJSON形式で生成してください。"
            f"**すべての発言は必ず日本語で出力してください。英語での回答は禁止です。**"
        )

        return "\n\n".join(parts)

    def _build_judge_prompt(
        self,
        debate_messages: List[AgentMessage],
        product_url: str,
        user_query: str,
        history: Optional[List[dict]] = None,
        product_info: Optional[str] = None,
        user_intervention: Optional[str] = None,
        selected_agents: Optional[List[str]] = None,
    ) -> str:
        """審判用のユーザープロンプトを構築する"""
        parts: list[str] = []

        parts.append(f"## 商品情報\n- URL: {product_url}")

        # 商品リサーチ情報（エージェントの主張の妥当性検証用）
        if product_info:
            parts.append(
                f"## 検索で得られた商品の詳細情報\n"
                f"以下はGoogle検索で収集したリアルタイムの商品情報です。"
                f"エージェントの主張がこの情報と一致しているかも考慮してください。"
                f"\n\n{product_info}"
            )

        parts.append(f"## ユーザーの悩み\n{user_query}")

        # 参加エージェントの情報
        if selected_agents:
            agent_labels = []
            for role in selected_agents:
                agent = AGENT_DEFINITIONS.get(role)
                if agent:
                    agent_labels.append(f"{agent['name']}（{agent['label']}）")
            parts.append(
                f"## 参加エージェント\n"
                f"{len(agent_labels)}人が議論に参加: {', '.join(agent_labels)}"
            )

        # 過去の議論履歴とスコア推移
        if history:
            parts.append("## これまでの議論とスコア推移")
            for past_turn in history:
                turn_id = past_turn["turn_id"]
                judge = past_turn.get("judge", {})
                past_score = judge.get("score", "N/A")
                past_reason = judge.get("reason", "")
                parts.append(f"### ターン {turn_id}（スコア: {past_score}）")
                for msg in past_turn.get("debate", []):
                    parts.append(
                        f"- **{msg['agent_name']}**: {msg['content']}"
                    )
                if past_reason:
                    parts.append(f"審判: {past_score}点 - {past_reason}")

        # ユーザー介入の情報
        if user_intervention:
            parts.append(
                f"## ユーザーからの介入\n"
                f"ユーザーは「{user_intervention}」という指示を出しています。"
                f"この意図をスコアに反映してください。"
            )

        parts.append("## 今回の議論内容")

        for msg in debate_messages:
            parts.append(f"- **{msg.agent_name}** ({msg.role}): {msg.content}")

        parts.append(
            "上記の情報をすべて踏まえて、購入推奨度をJSON形式で判定してください。"
            "**判定理由は必ず日本語で出力してください。英語での回答は禁止です。**"
        )

        return "\n\n".join(parts)

    # --- レスポンスパース ---

    def _parse_debate_response(
        self, response, selected_agents: Optional[List[str]] = None,
    ) -> List[AgentMessage]:
        """Geminiの議論レスポンスをパースしてAgentMessageリストに変換する"""
        if selected_agents is None:
            selected_agents = DEFAULT_AGENTS

        expected_count = len(selected_agents)

        try:
            data = json.loads(response.text)

            messages = []
            for msg_data in data.get("debate", []):
                messages.append(
                    AgentMessage(
                        agent_name=msg_data["agent_name"],
                        role=msg_data["role"],
                        content=msg_data["content"],
                    )
                )

            # 期待数に満たない場合はフォールバックで補完
            if len(messages) != expected_count:
                logger.warning(
                    f"Expected {expected_count} agent messages, got {len(messages)}. "
                    "Filling missing agents with defaults."
                )
                existing_roles = {m.role for m in messages}
                for role in selected_agents:
                    if role not in existing_roles:
                        agent = AGENT_DEFINITIONS.get(role)
                        if agent:
                            messages.append(
                                AgentMessage(
                                    agent_name=agent["name"],
                                    role=role,
                                    content="判断を保留します。追加情報が必要です。",
                                )
                            )

            return messages

        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Failed to parse debate response: {e}")
            logger.error(f"Raw response: {response.text}")
            # 選択されたエージェントに基づいてエラー用フォールバックを生成
            fallback_messages = []
            for role in selected_agents:
                agent = AGENT_DEFINITIONS.get(role)
                if agent:
                    fallback_messages.append(
                        AgentMessage(
                            agent_name=agent["name"],
                            role=role,
                            content="議論の生成中にエラーが発生しました。再度お試しください。",
                        )
                    )
            return fallback_messages

    def _parse_judge_response(self, response) -> JudgeResult:
        """Geminiの審判レスポンスをパースしてJudgeResultに変換する"""
        try:
            data = json.loads(response.text)

            score = int(data["score"])
            score = max(0, min(100, score))  # 0-100にクランプ
            reason = str(data["reason"])

            return JudgeResult(score=score, reason=reason)

        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as e:
            logger.error(f"Failed to parse judge response: {e}")
            logger.error(f"Raw response: {response.text}")
            return JudgeResult(
                score=50,
                reason="審判の判定中にエラーが発生しました。スコアは中立値としています。",
            )
