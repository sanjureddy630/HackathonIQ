import { useState } from "react";
import "./AIAssistant.css";

interface Match {
  participant_id: number;
  name: string;
  college: string;
  city: string;
  skills: string;
  team_option: string;
  team_name: string;
  idea: string;
  match_score: number;
}

interface MatchResponse {
  success: boolean;
  query: string;
  count: number;
  matching_method: string;
  model: string;
  matches: Match[];
}

interface Source {
  title: string;
  category: string;
  similarity: number;
}

interface AskResponse {
  success: boolean;
  query: string;
  answer: string;
  grounded: boolean;
  retrieved_count: number;
  sources: Source[];
}

type AIMode = "ask" | "match";

const API_URL = "http://127.0.0.1:8000";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<AIMode>("ask");

  const [matches, setMatches] = useState<Match[]>([]);
  const [answer, setAnswer] = useState<AskResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const askExamples = [
    "Can I get free food at the hackathon?",
    "Can I participate alone?",
    "What is the prize pool?",
    "Where is the hackathon happening?",
  ];

  const matchExamples = [
    "I need a Python developer for an AI healthcare project",
    "Find someone with React and frontend skills",
    "I need an AI and machine learning teammate",
  ];

  const examples = mode === "ask" ? askExamples : matchExamples;

  const resetResults = () => {
    setAnswer(null);
    setMatches([]);
    setSearched(false);
    setError("");
  };

  const changeMode = (newMode: AIMode) => {
    setMode(newMode);
    setQuery("");
    resetResults();
  };

  const askHackathonAI = async () => {
    if (!query.trim()) {
      setError("Ask Hackathon IQ a question first.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setAnswer(null);
    setMatches([]);

    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query.trim(),
        }),
      });

      const data: AskResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "object" && data !== null && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : "Hackathon AI request failed."
        );
      }

      setAnswer(data);
    } catch (err) {
      console.error("Hackathon AI error:", err);

      setError(
        "Unable to connect to Hackathon IQ AI. Make sure the backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const findTeammates = async () => {
    if (!query.trim()) {
      setError("Tell the AI what kind of teammate you are looking for.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setMatches([]);
    setAnswer(null);

    try {
      const response = await fetch(`${API_URL}/api/ai/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k: 5,
        }),
      });

      const data: MatchResponse = await response.json();

      if (!response.ok) {
        throw new Error("AI matching failed.");
      }

      setMatches(data.matches || []);
    } catch (err) {
      console.error("AI matching error:", err);

      setError(
        "Unable to connect to Hackathon IQ AI. Make sure the backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "ask") {
      askHackathonAI();
    } else {
      findTeammates();
    }
  };

  const useExample = (example: string) => {
    setQuery(example);
    setError("");
    setAnswer(null);
    setMatches([]);
    setSearched(false);
  };

  const getScoreClass = (score: number) => {
    if (score >= 70) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <main className="ai-page">
      {/* Background */}
      <div className="ai-background-grid" />
      <div className="ai-glow ai-glow-one" />
      <div className="ai-glow ai-glow-two" />

      {/* Hero */}
      <section className="ai-hero">
        <div className="ai-eyebrow">
          <span className="ai-status-dot" />
          HACKATHON IQ AI
        </div>

        <h1>
          Your hackathon
          <br />
          <span>AI copilot.</span>
        </h1>

        <p>
          Ask anything about Hackathon IQ or describe the teammate you need.
          Our AI searches the hackathon knowledge base and participant network
          to help you move faster.
        </p>
      </section>

      {/* AI Panel */}
      <section className="ai-search-section">
        <div className="ai-search-card">

          {/* Mode Selector */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => changeMode("ask")}
              style={{
                padding: "12px 20px",
                border:
                  mode === "ask"
                    ? "1px solid #c8ff00"
                    : "1px solid #333",
                background:
                  mode === "ask"
                    ? "#0d1000"
                    : "transparent",
                color:
                  mode === "ask"
                    ? "#c8ff00"
                    : "#888",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✦ Ask Hackathon IQ
            </button>

            <button
              type="button"
              onClick={() => changeMode("match")}
              style={{
                padding: "12px 20px",
                border:
                  mode === "match"
                    ? "1px solid #c8ff00"
                    : "1px solid #333",
                background:
                  mode === "match"
                    ? "#0d1000"
                    : "transparent",
                color:
                  mode === "match"
                    ? "#c8ff00"
                    : "#888",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              👥 Find Teammates
            </button>
          </div>

          <div className="ai-search-top">
            <div className="ai-bot-icon">✦</div>

            <div>
              <div className="ai-search-label">
                {mode === "ask"
                  ? "ASK HACKATHON IQ"
                  : "FIND YOUR TEAM"}
              </div>

              <div className="ai-search-description">
                {mode === "ask"
                  ? "Ask anything about the hackathon."
                  : "Describe who you want on your team."}
              </div>
            </div>
          </div>

          <textarea
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
              ) {
                handleSubmit();
              }
            }}
            placeholder={
              mode === "ask"
                ? "Example: Can I get free food at the hackathon?"
                : "Example: I need someone who knows Python, AI and healthcare..."
            }
            maxLength={2000}
          />

          <div className="ai-input-footer">
            <span>{query.length}/2000</span>
            <span>Ctrl + Enter to search</span>
          </div>

          <button
            className="ai-search-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="ai-spinner" />
                {mode === "ask"
                  ? "Hackathon IQ is thinking..."
                  : "Finding teammates..."}
              </>
            ) : (
              <>
                {mode === "ask"
                  ? "Ask Hackathon IQ"
                  : "Find my teammates"}
                <span className="ai-arrow">→</span>
              </>
            )}
          </button>

          {error && (
            <div className="ai-error">
              <span>!</span>
              {error}
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="ai-examples">
          <span>TRY ASKING</span>

          <div className="ai-example-list">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => useExample(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Answer */}
      {searched && mode === "ask" && (
        <section className="ai-results-section">
          <div className="ai-results-header">
            <div>
              <div className="ai-results-eyebrow">
                HACKATHON IQ AI
              </div>

              <h2>
                {loading
                  ? "Hackathon IQ is thinking..."
                  : "Here's what I found."}
              </h2>

              {!loading && answer && (
                <p>
                  Answer generated from the official Hackathon IQ
                  knowledge base.
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="ai-loading-card">
              <div className="loading-orbit">
                <div />
              </div>

              <h3>AI is searching the hackathon knowledge base</h3>

              <p>
                Checking official Hackathon IQ information...
              </p>
            </div>
          ) : answer ? (
            <div
              className="ai-answer-card"
              style={{
                border: "1px solid #292929",
                background: "#080808",
                padding: "32px",
                marginTop: "25px",
              }}
            >
              <div
                style={{
                  color: "#c8ff00",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "2px",
                  marginBottom: "15px",
                }}
              >
                AI ANSWER
              </div>

              <div
                style={{
                  color: "#f5f5f5",
                  fontSize: "20px",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {answer.answer}
              </div>

              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: "1px solid #222",
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  color: "#777",
                  fontSize: "12px",
                }}
              >
                <span>
                  ● {answer.grounded ? "GROUNDED ANSWER" : "AI RESPONSE"}
                </span>

                <span>
                  {answer.retrieved_count} knowledge sources
                </span>
              </div>

              {answer.sources && answer.sources.length > 0 && (
                <div style={{ marginTop: "25px" }}>
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "12px",
                      letterSpacing: "1px",
                    }}
                  >
                    SOURCES
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {answer.sources.map((source, index) => (
                      <span
                        key={`${source.title}-${index}`}
                        style={{
                          border: "1px solid #292929",
                          padding: "8px 12px",
                          color: "#888",
                          fontSize: "12px",
                        }}
                      >
                        {source.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ai-empty-card">
              <div className="empty-icon">⌕</div>

              <h3>No answer returned</h3>

              <p>
                Try asking your question again using more specific
                words.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Teammate Results */}
      {searched && mode === "match" && (
        <section className="ai-results-section">
          <div className="ai-results-header">
            <div>
              <div className="ai-results-eyebrow">
                AI ANALYSIS
              </div>

              <h2>
                {loading
                  ? "Finding your best matches..."
                  : matches.length > 0
                    ? "Your strongest matches."
                    : "No strong matches found."}
              </h2>

              {!loading && matches.length > 0 && (
                <p>
                  Based on semantic similarity between your request
                  and participant skills, ideas, and team information.
                </p>
              )}
            </div>

            {!loading && matches.length > 0 && (
              <div className="ai-result-count">
                <strong>{matches.length}</strong>
                <span>matches</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="ai-loading-card">
              <div className="loading-orbit">
                <div />
              </div>

              <h3>AI is analyzing the participant network</h3>

              <p>
                Comparing your request against skills, ideas,
                and participant profiles...
              </p>
            </div>
          ) : matches.length > 0 ? (
            <div className="ai-match-grid">
              {matches.map((match, index) => (
                <article
                  className="ai-match-card"
                  key={match.participant_id}
                >
                  <div className="match-card-top">
                    <div className="match-rank">
                      #{String(index + 1).padStart(2, "0")}
                    </div>

                    <div
                      className={`match-score ${getScoreClass(
                        match.match_score
                      )}`}
                    >
                      <strong>
                        {match.match_score.toFixed(2)}%
                      </strong>

                      <span>AI MATCH</span>
                    </div>
                  </div>

                  <div className="match-profile">
                    <div className="match-avatar">
                      {getInitials(match.name)}
                    </div>

                    <div className="match-identity">
                      <h3>{match.name}</h3>

                      <p>{match.college}</p>
                    </div>
                  </div>

                  <div className="match-location">
                    <span>⌖</span>
                    {match.city}
                  </div>

                  <div className="match-divider" />

                  <div className="match-section">
                    <span className="match-label">
                      SKILLS
                    </span>

                    <div className="skill-tags">
                      {match.skills
                        ? match.skills
                            .split(",")
                            .map((skill) => (
                              <span key={skill}>
                                {skill.trim()}
                              </span>
                            ))
                        : (
                          <span>No skills listed</span>
                        )}
                    </div>
                  </div>

                  {match.idea && (
                    <div className="match-section">
                      <span className="match-label">
                        PROJECT IDEA
                      </span>

                      <p className="match-idea">
                        {match.idea}
                      </p>
                    </div>
                  )}

                  <div className="match-footer">
                    <div>
                      <span className="match-team-label">
                        PARTICIPATION
                      </span>

                      <strong>
                        {match.team_option}
                      </strong>
                    </div>

                    {match.team_name && (
                      <div className="match-team-name">
                        {match.team_name}
                      </div>
                    )}
                  </div>

                  <button
                    className="match-connect-button"
                    type="button"
                  >
                    View potential teammate
                    <span>→</span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="ai-empty-card">
              <div className="empty-icon">⌕</div>

              <h3>No matching participants yet</h3>

              <p>
                Try describing your requirements using specific
                technologies, skills, or project domains.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <section className="ai-tech-section">
        <div className="ai-tech-line" />

        <div className="ai-tech-content">
          <span>POWERED BY</span>

          <strong>
            Hackathon IQ Semantic Intelligence
          </strong>

          <span className="ai-tech-model">
            all-MiniLM-L6-v2
          </span>
        </div>
      </section>
    </main>
  );
}