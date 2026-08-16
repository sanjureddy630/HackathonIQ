# ============================================================
# HACKATHON IQ — FREE LOCAL RAG ENGINE
# No OpenAI API
# No external AI API
# Lightweight and Render Free compatible
# ============================================================

import re
from collections import Counter

from knowledge_base import get_knowledge_base


# ============================================================
# KNOWLEDGE BASE
# ============================================================

knowledge_base = get_knowledge_base()

print(f"HACKATHON IQ KNOWLEDGE BASE LOADED: {len(knowledge_base)} items")


# ============================================================
# TEXT PROCESSING
# ============================================================

STOP_WORDS = {
    "a", "an", "the", "is", "are", "am", "was", "were",
    "be", "been", "being", "to", "of", "in", "on", "at",
    "for", "from", "and", "or", "with", "do", "does",
    "did", "will", "would", "can", "could", "should",
    "what", "who", "where", "when", "why", "how",
    "me", "my", "i", "we", "you", "they", "it", "this",
    "that", "tell", "please", "about"
}


def tokenize(text: str):
    """
    Convert text into useful lowercase words.
    """

    words = re.findall(r"[a-zA-Z0-9₹]+", text.lower())

    return [
        word
        for word in words
        if word not in STOP_WORDS and len(word) > 1
    ]


# ============================================================
# PREPARE DOCUMENTS
# ============================================================

documents = []

for item in knowledge_base:

    text = " ".join([
        str(item.get("category", "")),
        str(item.get("title", "")),
        str(item.get("content", ""))
    ])

    documents.append({
        "id": item["id"],
        "category": item["category"],
        "title": item["title"],
        "content": item["content"].strip(),
        "tokens": set(tokenize(text))
    })


# ============================================================
# RETRIEVE CONTEXT
# ============================================================

def retrieve_context(
    query: str,
    top_k: int = 3,
    threshold: float = 0.20
):

    if not query or not query.strip():
        return []

    query_tokens = set(tokenize(query))

    if not query_tokens:
        return []

    results = []

    for document in documents:

        document_tokens = document["tokens"]

        if not document_tokens:
            continue

        # ----------------------------------------------------
        # Word overlap
        # ----------------------------------------------------

        overlap = query_tokens.intersection(document_tokens)

        if not overlap:
            continue

        # ----------------------------------------------------
        # Similarity score
        # ----------------------------------------------------

        precision = len(overlap) / len(query_tokens)
        recall = len(overlap) / len(document_tokens)

        # F1-style score
        if precision + recall == 0:
            score = 0
        else:
            score = (
                2 * precision * recall
                / (precision + recall)
            )

        # Extra weight when important query words
        # appear in the title.
        title_tokens = set(tokenize(document["title"]))

        title_overlap = query_tokens.intersection(title_tokens)

        if title_overlap:
            score += 0.20 * (
                len(title_overlap) / len(query_tokens)
            )

        score = min(score, 1.0)

        if score >= threshold:

            results.append({
                "id": document["id"],
                "category": document["category"],
                "title": document["title"],
                "content": document["content"],
                "similarity": round(float(score), 4)
            })

    # Highest score first
    results.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    return results[:top_k]


# ============================================================
# LOCAL ANSWER GENERATION
# ============================================================

def generate_rag_answer(
    query: str,
    retrieved_documents: list
):

    if not retrieved_documents:

        return (
            "I couldn't find official information about that "
            "in the Hackathon IQ knowledge base."
        )

    # Best matching official answer
    best = retrieved_documents[0]

    return best["content"]


# ============================================================
# GENERAL QUESTION FALLBACK
# ============================================================

def generate_general_answer(query: str):

    return (
        "I can answer questions about Hackathon IQ using "
        "the official event information available to me. "
        "Please ask me about prizes, food, eligibility, "
        "registration, rules, schedule, venue, or other "
        "Hackathon IQ details."
    )


# ============================================================
# MAIN HACKATHON IQ AI
# ============================================================

def ask_hackathon_ai(query: str):

    query = query.strip()

    # --------------------------------------------------------
    # Empty question
    # --------------------------------------------------------

    if not query:

        return {
            "query": query,
            "answer": "Please ask me a question.",
            "grounded": False,
            "mode": "validation",
            "retrieved_count": 0,
            "sources": []
        }

    # --------------------------------------------------------
    # Search official knowledge base
    # --------------------------------------------------------

    retrieved = retrieve_context(
        query=query,
        top_k=3,
        threshold=0.20
    )

    # --------------------------------------------------------
    # Official Hackathon IQ question
    # --------------------------------------------------------

    if retrieved:

        answer = generate_rag_answer(
            query=query,
            retrieved_documents=retrieved
        )

        return {
            "query": query,
            "answer": answer,
            "grounded": True,
            "mode": "hackathon_rag",
            "retrieved_count": len(retrieved),
            "sources": [
                {
                    "title": item["title"],
                    "category": item["category"],
                    "similarity": item["similarity"]
                }
                for item in retrieved
            ]
        }

    # --------------------------------------------------------
    # Unknown/general question
    # --------------------------------------------------------

    answer = generate_general_answer(query)

    return {
        "query": query,
        "answer": answer,
        "grounded": False,
        "mode": "general_ai",
        "retrieved_count": 0,
        "sources": []
    }