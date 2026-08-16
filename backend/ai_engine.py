from sentence_transformers import SentenceTransformer
import numpy as np


# Load AI model once when backend starts
model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embedding(text: str):
    """
    Convert text into a numerical vector.
    """
    if not text:
        return []

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()


def similarity_score(text1: str, text2: str):
    """
    Calculate semantic similarity between two pieces of text.
    """

    if not text1 or not text2:
        return 0.0

    embeddings = model.encode(
        [text1, text2],
        normalize_embeddings=True
    )

    score = np.dot(embeddings[0], embeddings[1])

    return float(score)


def find_best_matches(query: str, participants: list, top_k: int = 5):
    """
    Find participants whose skills/idea are most similar
    to the user's query.
    """

    if not query or not participants:
        return []

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    )

    results = []

    for participant in participants:

        profile_text = " ".join([
            str(participant.get("full_name", "")),
            str(participant.get("skills", "")),
            str(participant.get("idea", "")),
            str(participant.get("team_name", ""))
        ])

        if not profile_text.strip():
            continue

        participant_embedding = model.encode(
            profile_text,
            normalize_embeddings=True
        )

        score = float(
            np.dot(
                query_embedding,
                participant_embedding
            )
        )

        results.append({
            "participant": participant,
            "match_score": round(score * 100, 2)
        })

    results.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return results[:top_k]