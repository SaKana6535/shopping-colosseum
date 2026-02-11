"""議論タイトル生成 - 議論内容や商品情報からチャット風のタイトルを生成"""

import re
from typing import Optional
from urllib.parse import urlparse


def generate_debate_title(turn_data: dict, user_query: str = "", product_url: str = "") -> str:
    """
    議論の初回ターンからタイトルを生成する。
    優先順位: 議論内容 > 審判の理由 > ユーザーの悩み > URLから抽出
    """
    # 1. 議論内容から取得（最初のエージェントの発言に商品名が含まれることが多い）
    debate = turn_data.get("debate", [])
    if debate:
        for msg in debate:
            content = msg.get("content", "").strip()
            if not content:
                continue
            # 最初の文を取得（句点で区切る）
            first_sentence = content.split("。")[0].strip()
            if first_sentence:
                # 「この〇〇は」「〇〇について」などのパターンを簡略化
                title = _extract_product_phrase(first_sentence)
                if title and len(title) >= 3:
                    return _truncate(title, 48)

    # 2. 審判の理由から取得（議論の要約が含まれることが多い）
    judge = turn_data.get("judge", {})
    reason = judge.get("reason", "").strip()
    if reason:
        title = _extract_product_phrase(reason) or reason
        return _truncate(title, 48)

    # 3. ユーザーの悩みから取得
    if user_query and len(user_query.strip()) > 0:
        return _truncate(user_query.strip(), 48)

    # 4. URLからドメインやパスをヒントに取得
    if product_url:
        return _extract_from_url(product_url)

    return "新しい議論"


def _extract_product_phrase(text: str) -> Optional[str]:
    """
    テキストから商品名や議論の主題らしきフレーズを抽出する。
    """
    text = text.strip()
    if not text:
        return None

    # よくあるパターン: 「この〇〇は」「〇〇について」「〇〇の購入」
    patterns = [
        r"この(.+?)は",  # このワイヤレスイヤホンは
        r"「(.+?)」",   # 「商品名」
        r"(.+?)について",  # 〇〇について
        r"(.+?)の購入",   # 〇〇の購入判定
        r"^(.+?)の",     # 〇〇のスペック
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phrase = match.group(1).strip()
            if len(phrase) >= 2 and len(phrase) <= 40:
                return phrase

    # パターンにマッチしない場合は最初の文をそのまま返す
    return text


def _truncate(text: str, max_len: int) -> str:
    """指定文字数で切り詰め、省略記号を付ける"""
    text = text.strip()
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"


def _extract_from_url(url: str) -> str:
    """URLから表示用の短い文字列を抽出"""
    try:
        parsed = urlparse(url)
        path = parsed.path.strip("/")
        if path:
            # パスの最後のセグメント（商品IDやスラッグ）を取得
            segments = path.split("/")
            last = segments[-1] if segments else ""
            # 長いハッシュやIDは短くする
            if len(last) > 30:
                last = last[:27] + "..."
            return last if last else parsed.netloc or "商品リンク"
        return parsed.netloc or "商品リンク"
    except Exception:
        return "商品リンク"
