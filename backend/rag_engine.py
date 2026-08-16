# ============================================================
# HACKATHON IQ — LOCAL RAG AI ENGINE
# NO OPENAI API KEY REQUIRED
# ============================================================

import numpy as np

from sentence_transformers import SentenceTransformer

from knowledge_base import get_knowledge_base


# ============================================================
# EMBEDDING MODEL
# ============================================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("RAG EMBEDDING MODEL READY")


# ============================================================
# KNOWLEDGE BASE
# ============================================================

knowledge_base = get_knowledge_base()

print(
    f"HACKATHON IQ KNOWLEDGE BASE LOADED: "
    f"{len(knowledge_base)} documents"
)


# ============================================================
# DOCUMENT EMBEDDINGS
# ============================================================

documents = []

for item in knowledge_base:

    text = " ".join([
        item["category"],
        item["title"],
        item["content"]
    ])

    documents.append(text)


document_embeddings = embedding_model.encode(
    documents,
    normalize_embeddings=True
)

print("HACKATHON IQ DOCUMENT EMBEDDINGS READY")


# ============================================================
# RETRIEVE HACKATHON KNOWLEDGE
# ============================================================

def retrieve_context(
    query: str,
    top_k: int = 3,
    threshold: float = 0.55
):

    if not query or not query.strip():
        return []

    query_embedding = embedding_model.encode(
        query,
        normalize_embeddings=True
    )

    scores = np.dot(
        document_embeddings,
        query_embedding
    )

    ranked_indexes = np.argsort(scores)[::-1]

    results = []

    for index in ranked_indexes[:top_k]:

        score = float(scores[index])

        if score < threshold:
            continue

        item = knowledge_base[index]

        results.append({
            "id": item["id"],
            "category": item["category"],
            "title": item["title"],
            "content": item["content"].strip(),
            "similarity": round(score, 4)
        })

    return results


# ============================================================
# LOCAL ANSWER GENERATOR
# ============================================================

def generate_local_answer(
    query: str,
    retrieved_documents: list
):

    if not retrieved_documents:

        return (
            "I couldn't find this information in the official "
            "Hackathon IQ information. Please ask me about the "
            "hackathon, registration, prizes, teams, eligibility, "
            "schedule, venue, or other official event information."
        )

    # --------------------------------------------------------
    # Best matching official document
    # --------------------------------------------------------

    best_document = retrieved_documents[0]

    content = best_document["content"].strip()

    # --------------------------------------------------------
    # Normalize query for simple question handling
    # --------------------------------------------------------

    query_lower = query.lower().strip()

    # --------------------------------------------------------
    # Prize questions
    # --------------------------------------------------------

    prize_keywords = [
        "prize",
        "prizes",
        "prize pool",
        "first prize",
        "second prize",
        "third prize",
        "winner",
        "winning"
    ]

    if any(
        keyword in query_lower
        for keyword in prize_keywords
    ):

        matching_documents = []

        for item in retrieved_documents:

            text = (
                item["title"] + " " +
                item["content"]
            ).lower()

            if any(
                keyword in text
                for keyword in prize_keywords
            ):
                matching_documents.append(item)

        if matching_documents:

            answer_parts = []

            for item in matching_documents:

                answer_parts.append(
                    item["content"].strip()
                )

            return "\n\n".join(answer_parts)


    # --------------------------------------------------------
    # Registration questions
    # --------------------------------------------------------

    registration_keywords = [
        "register",
        "registration",
        "registration process",
        "how to register",
        "sign up",
        "signup"
    ]

    if any(
        keyword in query_lower
        for keyword in registration_keywords
    ):

        for item in retrieved_documents:

            text = (
                item["title"] + " " +
                item["content"]
            ).lower()

            if any(
                keyword in text
                for keyword in registration_keywords
            ):

                return item["content"].strip()


    # --------------------------------------------------------
    # Team questions
    # --------------------------------------------------------

    team_keywords = [
        "team",
        "teammate",
        "team member",
        "find team",
        "team size"
    ]

    if any(
        keyword in query_lower
        for keyword in team_keywords
    ):

        for item in retrieved_documents:

            text = (
                item["title"] + " " +
                item["content"]
            ).lower()

            if any(
                keyword in text
                for keyword in team_keywords
            ):

                return item["content"].strip()


    # --------------------------------------------------------
    # General Hackathon IQ question
    # --------------------------------------------------------

    return content


# ============================================================
# MAIN HACKATHON IQ AI
# ============================================================

def ask_hackathon_ai(query: str):

    query = query.strip()

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
    # SEARCH OFFICIAL HACKATHON IQ KNOWLEDGE
    # --------------------------------------------------------

    retrieved = retrieve_context(
        query=query,
        top_k=3,
        threshold=0.55
    )


    # --------------------------------------------------------
    # OFFICIAL HACKATHON IQ QUESTION
    # --------------------------------------------------------

    if retrieved:

        answer = generate_local_answer(
            query=query,
            retrieved_documents=retrieved
        )

        return {
            "query": query,
            "answer": answer,
            "grounded": True,
            "mode": "local_hackathon_rag",
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
    # QUESTION NOT FOUND
    # --------------------------------------------------------

    return {
        "query": query,
        "answer": (
            "I couldn't find this information in the official "
            "Hackathon IQ knowledge base."
        ),
        "grounded": False,
        "mode": "local_knowledge_only",
        "retrieved_count": 0,
        "sources": []
    }