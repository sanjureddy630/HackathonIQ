from ai_engine import similarity_score


def analyze_idea(idea: str):
    """
    Analyze a hackathon idea using semantic AI.
    """

    idea = idea.strip()

    if not idea:
        return {
            "success": False,
            "message": "Please provide an idea."
        }

    # Basic semantic signals
    innovation_score = calculate_innovation_score(idea)
    clarity_score = calculate_clarity_score(idea)
    feasibility_score = calculate_feasibility_score(idea)
    impact_score = calculate_impact_score(idea)

    overall_score = round(
        (
            innovation_score
            + clarity_score
            + feasibility_score
            + impact_score
        ) / 4,
        1
    )

    return {
        "success": True,
        "idea": idea,
        "analysis": {
            "overall_score": overall_score,
            "innovation": innovation_score,
            "clarity": clarity_score,
            "technical_feasibility": feasibility_score,
            "potential_impact": impact_score,
        },
        "strengths": generate_strengths(idea),
        "improvements": generate_improvements(idea),
    }


def calculate_innovation_score(idea: str):
    """
    Estimate innovation based on the uniqueness of the wording.
    """

    words = set(idea.lower().split())

    technology_terms = {
        "ai",
        "artificial",
        "machine",
        "learning",
        "blockchain",
        "iot",
        "computer",
        "vision",
        "generative",
        "automation",
        "predictive",
        "intelligent",
        "nlp",
        "cloud",
    }

    matches = len(words.intersection(technology_terms))

    score = 6 + min(matches, 4) * 0.8

    return round(min(score, 10), 1)


def calculate_clarity_score(idea: str):
    """
    Estimate clarity using idea length and structure.
    """

    word_count = len(idea.split())

    if word_count < 8:
        return 5.5

    if word_count < 15:
        return 7.0

    if word_count < 30:
        return 8.5

    return 9.0


def calculate_feasibility_score(idea: str):
    """
    Estimate technical feasibility.
    """

    complex_terms = {
        "ai",
        "machine learning",
        "cloud",
        "web",
        "mobile",
        "automation",
        "api",
        "database",
        "iot",
        "analytics",
    }

    idea_lower = idea.lower()

    matches = sum(
        1
        for term in complex_terms
        if term in idea_lower
    )

    if matches >= 3:
        return 8.5

    if matches >= 1:
        return 8.0

    return 7.0


def calculate_impact_score(idea: str):
    """
    Estimate potential impact from common problem domains.
    """

    impact_terms = {
        "health",
        "healthcare",
        "education",
        "student",
        "environment",
        "climate",
        "agriculture",
        "safety",
        "accessibility",
        "finance",
        "employment",
        "community",
        "waste",
        "energy",
    }

    idea_lower = idea.lower()

    matches = sum(
        1
        for term in impact_terms
        if term in idea_lower
    )

    if matches >= 2:
        return 9.0

    if matches == 1:
        return 8.0

    return 6.5


def generate_strengths(idea: str):
    """
    Generate strengths based on the idea.
    """

    strengths = []

    idea_lower = idea.lower()

    if any(
        word in idea_lower
        for word in ["ai", "machine learning", "automation"]
    ):
        strengths.append(
            "Uses intelligent technology to solve the problem."
        )

    if any(
        word in idea_lower
        for word in ["health", "education", "environment", "student"]
    ):
        strengths.append(
            "Targets a meaningful real-world problem."
        )

    if any(
        word in idea_lower
        for word in ["app", "platform", "system", "website"]
    ):
        strengths.append(
            "Can be demonstrated effectively as a working product."
        )

    if not strengths:
        strengths.append(
            "The idea provides a foundation that can be developed into a hackathon prototype."
        )

    return strengths


def generate_improvements(idea: str):
    """
    Generate improvement suggestions.
    """

    improvements = []

    idea_lower = idea.lower()

    if len(idea.split()) < 12:
        improvements.append(
            "Describe the target users and the exact problem more clearly."
        )

    if not any(
        word in idea_lower
        for word in ["user", "student", "developer", "customer", "people"]
    ):
        improvements.append(
            "Clearly identify who will use the solution."
        )

    if not any(
        word in idea_lower
        for word in ["solve", "help", "reduce", "improve", "detect", "predict"]
    ):
        improvements.append(
            "Explain the measurable problem your solution is intended to solve."
        )

    improvements.append(
        "Define what makes the solution different from existing alternatives."
    )

    return improvements[:3]