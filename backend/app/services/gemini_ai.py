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
        "style_hints": [
            "具体的な数値やスペックを引用して主張する",
            "「〜というデータがあります」「客観的に見ると〜」のような表現を好む",
            "感情論には数値で反論する",
        ],
        "judge_criteria": "コストパフォーマンス: 価格に見合う価値があるか",
    },
    "emotional": {
        "name": "Ms. Emotion",
        "label": "感情派",
        "description": "デザイン、使用感、ワクワク感など感情面から評価する",
        "tone": "カジュアルで感情豊かな口調",
        "style_hints": [
            "「ワクワクする！」「テンション上がる！」など感嘆表現を多用",
            "使用シーンを想像した感情的な描写を入れる",
            "他の人の冷たい分析にも感情面から切り返す",
        ],
        "judge_criteria": "感情的満足度: 所有する喜びやワクワク感が得られるか",
    },
    "critical": {
        "name": "Dr. Risk",
        "label": "慎重派",
        "description": "リスク、懸念点、注意すべき点を指摘する",
        "tone": "慎重で専門的な口調",
        "style_hints": [
            "「しかし〜のリスクがあります」「注意すべき点として〜」を多用",
            "最悪のケースを想定して警告する",
            "楽観的な意見には必ず反対材料を提示する",
        ],
        "judge_criteria": "リスク: 購入に伴う懸念やリスクはどの程度か",
    },
    "cost_conscious": {
        "name": "Mr. Budget",
        "label": "コスト重視派",
        "description": "価格、費用対効果、長期的なコストの観点から評価する",
        "tone": "堅実で計算高い口調",
        "style_hints": [
            "「この価格帯なら〜」「費用対効果で考えると〜」を多用",
            "初期費用だけでなくランニングコストや維持費にも言及する",
            "代替品の価格との比較を示す",
        ],
        "judge_criteria": "費用対効果: 短期・長期の総コストに対して十分な価値があるか",
    },
    "eco_friendly": {
        "name": "Ms. Green",
        "label": "エコ派",
        "description": "環境への影響、サステナビリティ、省エネ性能の観点から評価する",
        "tone": "穏やかで地球思いな口調",
        "style_hints": [
            "「環境への配慮として〜」「サステナブルな観点では〜」を使う",
            "製品の素材やリサイクル可能性に着目する",
            "エネルギー効率や廃棄時の環境負荷に言及する",
        ],
        "judge_criteria": "環境・サステナビリティ: 環境負荷やエコ性能は適切か",
    },
    "aesthetic": {
        "name": "Ms. Design",
        "label": "デザイン派",
        "description": "見た目、デザインの完成度、美的価値の観点から評価する",
        "tone": "洗練されたセンスのある口調",
        "style_hints": [
            "「フォルムが美しい」「カラーリングが〜」など美的表現を使う",
            "インテリアや生活空間との調和に言及する",
            "デザインの細部やディテールに注目する",
        ],
        "judge_criteria": "デザイン・美的価値: 見た目の完成度や所有感が高いか",
    },
    "practical": {
        "name": "Mr. Practical",
        "label": "実用派",
        "description": "実際の使い勝手、メンテナンス性、日常利用の観点から評価する",
        "tone": "現実的で実践的な口調",
        "style_hints": [
            "「実際に使ってみると〜」「日常的には〜」の表現を好む",
            "メンテナンスの手間や耐久性に言及する",
            "理想と現実のギャップを指摘する",
        ],
        "judge_criteria": "実用性: 日常の使い勝手やメンテナンス性は良好か",
    },
    "data_driven": {
        "name": "Dr. Data",
        "label": "データ派",
        "description": "レビューデータ、統計、市場動向の数値的分析から評価する",
        "tone": "分析的で数字にこだわる口調",
        "style_hints": [
            "「レビューの平均評価は〜」「統計的に見ると〜」を多用",
            "パーセンテージや具体的な数値を積極的に引用する",
            "データの傾向やパターンから結論を導く",
        ],
        "judge_criteria": "データ裏付け: レビューデータや統計が購入を支持しているか",
    },
    "trendy": {
        "name": "Ms. Trend",
        "label": "トレンド派",
        "description": "最新トレンド、SNSでの話題性、流行の観点から評価する",
        "tone": "流行に敏感でキャッチーな口調",
        "style_hints": [
            "「今トレンドの〜」「SNSでバズってる〜」のような表現を使う",
            "インフルエンサーや有名人の使用例に言及する",
            "流行の移り変わりや次のトレンド予測にも触れる",
        ],
        "judge_criteria": "トレンド性: 最新の流行や話題性を踏まえた選択か",
    },
    "social_proof": {
        "name": "Mr. Social",
        "label": "口コミ派",
        "description": "購入者レビュー、口コミ、ユーザー体験の観点から評価する",
        "tone": "人の意見を大切にする口調",
        "style_hints": [
            "「多くの購入者が〜と言っています」「口コミでは〜」を多用",
            "実際のユーザーの声を引用する形式を好む",
            "高評価・低評価の両方の口コミをバランスよく紹介する",
        ],
        "judge_criteria": "ユーザー評価: 実際の購入者の満足度や口コミ傾向はどうか",
    },
}

DEFAULT_AGENTS = ["logical", "emotional", "critical"]

# 直近何ターンのフル履歴を保持するか（それ以前はサマリーに圧縮）
MAX_FULL_HISTORY_TURNS = 3


def _build_system_instruction(
    selected_agents: List[str],
    debate_mode: str = "discussion",
) -> str:
    """選択されたエージェントとモードに基づいてシステムプロンプトを動的に構築する"""
    agent_count = len(selected_agents)

    if debate_mode == "discussion":
        intro = (
            f"あなたは{agent_count}人の異なる人格を演じ分けるAIです。"
            f"商品の購入について、{agent_count}つの視点から白熱したディベートを行ってください。"
        )
    else:
        intro = (
            f"あなたは{agent_count}人の異なる人格を演じ分けるAIです。"
            f"商品の購入について、{agent_count}つの視点からそれぞれ独立したレビューを行ってください。"
        )

    parts = [intro, "", f"## {agent_count}人のキャラクター", ""]

    for i, role in enumerate(selected_agents, 1):
        agent = AGENT_DEFINITIONS.get(role)
        if not agent:
            continue
        style_hints_str = "\n".join(
            f"     - {hint}" for hint in agent.get("style_hints", [])
        )
        parts.append(
            f'{i}. **{agent["name"]}（{agent["label"]}）** - role: "{role}"\n'
            f'   - 観点: {agent["description"]}\n'
            f'   - 口調: {agent["tone"]}\n'
            f'   - 発言スタイル:\n{style_hints_str}'
        )

    parts.append("")

    # モード別ルール
    if debate_mode == "discussion":
        parts.append(
            "## ルール（ディスカッションモード）\n"
            "- **必ず日本語で回答すること（英語での回答は禁止）**\n"
            "- 他のエージェントの発言に対して、自分の視点から反論・同意・補足すること\n"
            "- ターン2以降は必ず他エージェントの名前を挙げて、その意見に言及すること\n"
            "- 議論を深め、互いの主張の弱点を指摘しながらも建設的な議論を目指すこと\n"
            "- 前のターンの議論と審判のスコアを踏まえて、議論を発展させること\n"
            "- 具体的で有用な情報を含めること\n"
            "- 各エージェントの発言は2〜4文程度にまとめること"
        )
    else:
        parts.append(
            "## ルール（レビューモード）\n"
            "- **必ず日本語で回答すること（英語での回答は禁止）**\n"
            "- 各エージェントはそれぞれの専門的な視点から独立した意見を述べること\n"
            "- 他のエージェントの意見に影響されず、自分の観点に集中すること\n"
            "- 前のターンの議論を踏まえて、自分の分析をさらに深めること\n"
            "- 具体的で有用な情報を含めること\n"
            "- 各エージェントの発言は2〜4文程度にまとめること"
        )

    return "\n".join(parts)


def _build_judge_system_instruction(selected_agents: List[str]) -> str:
    """参加エージェントに応じて審判のシステムプロンプトを動的に構築する"""
    # 基本の評価観点
    base_criteria = [
        "**品質・信頼性**: 製品の品質やブランドの信頼性は十分か",
        "**ユーザーニーズ合致度**: ユーザーの悩みや要望に合った製品か",
    ]

    # 参加エージェントに応じた評価観点を追加
    agent_criteria = []
    seen = set()
    for role in selected_agents:
        agent = AGENT_DEFINITIONS.get(role)
        if agent and "judge_criteria" in agent:
            criteria = agent["judge_criteria"]
            if criteria not in seen:
                agent_criteria.append(f"**{criteria}**")
                seen.add(criteria)

    all_criteria = agent_criteria + base_criteria
    criteria_str = "\n".join(
        f"{i}. {c}" for i, c in enumerate(all_criteria, 1)
    )

    return f"""\
あなたは公正な裁判官です。AIエージェントたちの商品購入に関する議論を読み、購入推奨度を総合的に判定してください。

## スコアリング基準
- 0: 絶対に買うべきではない
- 25: 購入には慎重になるべき
- 50: 中立（メリットとデメリットが拮抗）
- 75: 購入を前向きに検討すべき
- 100: 絶対に買うべき

## 評価観点
以下の観点を総合的に考慮してスコアを決定すること：
{criteria_str}

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

        self._model_name = settings.VERTEX_AI_MODEL

        # --- google-genai クライアント（Google Search Grounding 用） ---
        self.genai_client = genai.Client(
            vertexai=True,
            project=settings.GOOGLE_CLOUD_PROJECT,
            location="global",
            http_options=HttpOptions(api_version="v1"),
        )

        # 商品リサーチ結果のキャッシュ（(URL, query)をキーに再検索を防止）
        self._product_research_cache: dict[tuple[str, str], str] = {}

        # 議論生成モデルのキャッシュ（エージェント構成+モード別）
        self._debate_model_cache: dict[tuple, GenerativeModel] = {}

        # 審判モデルのキャッシュ（エージェント構成別）
        self._judge_model_cache: dict[tuple, GenerativeModel] = {}

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
            f"model={self._model_name}"
        )

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
        """Gemini APIで1ターン分の議論を生成する

        1. Google Search Grounding で商品情報をリサーチ
        2. リサーチ結果を含めてエージェントの発言を生成
        3. AI審判がスコアと判定理由を生成
        """
        if selected_agents is None:
            selected_agents = DEFAULT_AGENTS

        # 0. 商品情報をリサーチ（Google Search Grounding）
        product_info = await self._research_product(product_url, user_query)

        # 選択されたエージェントとモードに合わせて議論モデルを取得
        debate_model = self._get_debate_model(selected_agents, debate_mode)

        # 1. 議論を生成
        debate_prompt = self._build_debate_prompt(
            turn_id, product_url, user_query, user_intervention, history,
            product_info=product_info,
            selected_agents=selected_agents,
            debate_mode=debate_mode,
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
        judge_model = self._get_judge_model(selected_agents)

        judge_prompt = self._build_judge_prompt(
            debate_messages, product_url, user_query,
            history=history,
            product_info=product_info,
            user_intervention=user_intervention,
            selected_agents=selected_agents,
        )

        logger.debug(f"Judge prompt (turn {turn_id}):\n{judge_prompt}")

        judge_response = await judge_model.generate_content_async(
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

    def _get_debate_model(
        self, selected_agents: List[str], debate_mode: str = "discussion",
    ) -> GenerativeModel:
        """選択されたエージェントとモードに合わせた議論生成用モデルを返す（キャッシュ付き）"""
        cache_key = (tuple(sorted(selected_agents)), debate_mode)

        if cache_key in self._debate_model_cache:
            return self._debate_model_cache[cache_key]

        system_instruction = _build_system_instruction(
            selected_agents, debate_mode,
        )
        model = GenerativeModel(
            model_name=self._model_name,
            system_instruction=system_instruction,
        )
        self._debate_model_cache[cache_key] = model
        return model

    def _get_judge_model(self, selected_agents: List[str]) -> GenerativeModel:
        """参加エージェントに合わせた審判モデルを返す（キャッシュ付き）"""
        cache_key = tuple(sorted(selected_agents))

        if cache_key in self._judge_model_cache:
            return self._judge_model_cache[cache_key]

        system_instruction = _build_judge_system_instruction(selected_agents)
        model = GenerativeModel(
            model_name=self._model_name,
            system_instruction=system_instruction,
        )
        self._judge_model_cache[cache_key] = model
        return model

    # --- 商品リサーチ（Google Search Grounding） ---

    async def _research_product(
        self, product_url: str, user_query: str,
    ) -> Optional[str]:
        """Google Search Grounding を使って商品情報をリサーチする

        結果はキャッシュされ、同じURL+クエリに対する再検索を防ぐ。
        失敗時は None を返す。
        """
        cache_key = (product_url, user_query)

        # キャッシュにあればそれを返す
        if cache_key in self._product_research_cache:
            logger.info(f"Product research cache hit: {product_url}")
            return self._product_research_cache[cache_key]

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
                model=self._model_name,
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
            self._product_research_cache[cache_key] = product_info
            return product_info

        except Exception as e:
            logger.warning(
                f"Product research failed (falling back to None): {e}"
            )
            return None

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
        debate_mode: str = "discussion",
    ) -> str:
        """議論生成用のユーザープロンプトを構築する"""
        parts: list[str] = []

        parts.append(f"## 商品情報\n- URL: {product_url}")

        # Google Search Grounding で取得した商品情報を含める（成功時のみ）
        if product_info is not None:
            parts.append(
                f"## 検索で得られた商品の詳細情報\n"
                f"以下はGoogle検索で収集したリアルタイムの商品情報です。"
                f"この情報に基づいて議論してください。\n\n{product_info}"
            )

        parts.append(f"## ユーザーの悩み\n{user_query}")
        parts.append(f"## 現在のターン\nターン {turn_id}")

        # 過去の議論履歴を含める（審判スコアもフィードバック）
        if history:
            parts.append("## これまでの議論")
            for idx, past_turn in enumerate(history):
                past_turn_id = past_turn["turn_id"]
                judge = past_turn.get("judge", {})
                past_score = judge.get("score", "N/A")
                past_reason = judge.get("reason", "")

                # 直近ターンはフル情報、古いターンはサマリーに圧縮
                if len(history) - idx <= MAX_FULL_HISTORY_TURNS:
                    parts.append(
                        f"### ターン {past_turn_id}（審判スコア: {past_score}点）"
                    )
                    for msg in past_turn.get("debate", []):
                        parts.append(
                            f"- **{msg['agent_name']}**: {msg['content']}"
                        )
                    if past_reason:
                        parts.append(f"- 審判の判定: {past_reason}")
                else:
                    # サマリー形式（スコアと理由のみ）
                    parts.append(
                        f"### ターン {past_turn_id}（審判スコア: {past_score}点）"
                    )
                    if past_reason:
                        parts.append(f"- 審判の判定: {past_reason}")
                    parts.append("（詳細省略）")

        # ユーザー介入
        if user_intervention:
            parts.append(
                f"## ユーザーからの追加の関心事・要望\n"
                f"「{user_intervention}」\n"
                f"この要望を考慮して議論を展開してください。"
            )

        agent_count = len(selected_agents) if selected_agents else 3

        if debate_mode == "discussion" and turn_id > 1:
            parts.append(
                f"上記の情報を踏まえて、{agent_count}人のエージェントによるディベートをJSON形式で生成してください。"
                f"**他のエージェントの意見に必ず言及し、反論・同意・補足してください。**"
                f"**すべての発言は必ず日本語で出力してください。英語での回答は禁止です。**"
            )
        else:
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

        # 商品リサーチ情報（エージェントの主張の妥当性検証用、成功時のみ）
        if product_info is not None:
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
            for idx, past_turn in enumerate(history):
                turn_id = past_turn["turn_id"]
                judge = past_turn.get("judge", {})
                past_score = judge.get("score", "N/A")
                past_reason = judge.get("reason", "")

                # 直近ターンはフル情報、古いターンはサマリー
                if len(history) - idx <= MAX_FULL_HISTORY_TURNS:
                    parts.append(
                        f"### ターン {turn_id}（スコア: {past_score}）"
                    )
                    for msg in past_turn.get("debate", []):
                        parts.append(
                            f"- **{msg['agent_name']}**: {msg['content']}"
                        )
                    if past_reason:
                        parts.append(f"審判: {past_score}点 - {past_reason}")
                else:
                    parts.append(
                        f"### ターン {turn_id}（スコア: {past_score}）"
                    )
                    if past_reason:
                        parts.append(f"審判: {past_score}点 - {past_reason}")
                    parts.append("（詳細省略）")

        # ユーザー介入の情報
        if user_intervention:
            parts.append(
                f"## ユーザーからの追加の関心事\n"
                f"ユーザーは「{user_intervention}」という要望を出しています。"
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

        selected_set = set(selected_agents)

        try:
            data = json.loads(response.text)

            # selected_agents に含まれるロールのみを保持し、重複も排除
            messages = []
            seen_roles: set[str] = set()
            for msg_data in data.get("debate", []):
                role = msg_data.get("role")
                if role not in selected_set:
                    logger.warning(
                        f"Unexpected agent role '{role}' in response, skipping."
                    )
                    continue
                if role in seen_roles:
                    logger.warning(
                        f"Duplicate agent role '{role}' in response, skipping."
                    )
                    continue
                seen_roles.add(role)
                messages.append(
                    AgentMessage(
                        agent_name=msg_data["agent_name"],
                        role=msg_data["role"],
                        content=msg_data["content"],
                    )
                )

            # 期待数に満たない場合はフォールバックで補完
            for role in selected_agents:
                if role not in seen_roles:
                    agent = AGENT_DEFINITIONS.get(role)
                    if agent:
                        logger.warning(
                            f"Missing agent role '{role}', filling with default."
                        )
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
