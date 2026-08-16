import React, { useMemo, useState } from "react";
import "./Register.css";

const API_URL = "http://127.0.0.1:8000";

const SKILLS = [
  "Python",
  "Java",
  "C",
  "C++",
  "JavaScript",
  "TypeScript",
  "SQL",
  "React",
  "Next.js",
  "Node.js",
  "FastAPI",
  "Django",
  "Flutter",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Data Science",
  "Data Engineering",
  "NLP",
  "Computer Vision",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Cybersecurity",
  "Blockchain",
  "IoT",
  "UI/UX",
  "Figma",
];

const DOMAINS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Data Engineering",
  "Cybersecurity",
  "Cloud Computing",
  "Blockchain",
  "IoT",
  "FinTech",
  "HealthTech",
  "EdTech",
  "ClimateTech",
  "Open Innovation",
];

const TEAM_OPTIONS = [
  {
    value: "Team",
    title: "I HAVE A TEAM",
    description: "I'm already participating with my teammates.",
  },
  {
    value: "Find Team Members",
    title: "FIND TEAM MEMBERS",
    description: "Match me with compatible Hackathon IQ participants.",
  },
  {
    value: "Individual",
    title: "PARTICIPATE SOLO",
    description: "I'll participate independently.",
  },
];

const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  gender: "",
  college: "",
  city: "",
  tshirt_size: "",
  experience_level: "",
  github: "",
  linkedin: "",
  challenge_domain: "",
  team_option: "",
  team_name: "",
  idea: "",
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
const [registrationId, setRegistrationId] = useState<number | null>(null);

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [showTeamMatches, setShowTeamMatches] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text:
        "Hi! I'm Hackathon IQ Copilot. Ask me about the event, teams, registration, skills, venue, or what to build.",
    },
  ]);

  const [teamMatches, setTeamMatches] = useState<any[]>([]);
  const [teamFinderLoading, setTeamFinderLoading] = useState(false);
  const [teamFinderError, setTeamFinderError] = useState("");

  const skillCount = useMemo(() => skills.length, [skills]);

  const askCopilot = async () => {
    const question = copilotInput.trim();

    if (!question) return;

    setCopilotMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);
    setCopilotInput("");

    // Try the backend AI endpoint if it exists.
    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data?.answer) {
          setCopilotMessages((previous) => [
            ...previous,
            { role: "assistant", text: data.answer },
          ]);
          return;
        }
      }
    } catch {
      // The registration system does not depend on AI.
    }

    // No API key required: useful local Hackathon IQ fallback.
    const q = question.toLowerCase();

    let answer =
      "I can help with Hackathon IQ registration, teams, skills, the event venue, and hackathon basics. Try asking about the date, location, team options, or skills.";

    if (q.includes("date") || q.includes("when")) {
      answer = "Hackathon IQ takes place on 15–16 October 2026.";
    } else if (
      q.includes("location") ||
      q.includes("venue") ||
      q.includes("where")
    ) {
      answer =
        "The hackathon is at Corner Stone IT Solutions, Hyderabad.";
    } else if (
      q.includes("solo") ||
      q.includes("alone") ||
      q.includes("individual")
    ) {
      answer =
        "Yes. The registration form includes a Participate Solo option.";
    } else if (
      q.includes("team") ||
      q.includes("teammate") ||
      q.includes("member")
    ) {
      answer =
        "You can choose I Have a Team, Find Team Members, or Participate Solo during registration.";
    } else if (
      q.includes("skill") ||
      q.includes("skills")
    ) {
      answer =
        "Select all the skills you can contribute. Multiple skills can be selected, which will also help with future teammate matching.";
    } else if (
      q.includes("shirt") ||
      q.includes("t-shirt") ||
      q.includes("size")
    ) {
      answer =
        "T-shirt sizes available in the registration form are S, M, L, XL, and XXL.";
    } else if (
      q.includes("gender") ||
      q.includes("male") ||
      q.includes("female")
    ) {
      answer =
        "The registration form asks you to select Male or Female.";
    } else if (
      q.includes("prize") ||
      q.includes("pool")
    ) {
      answer =
        "The prizes are: 1st Prize — ₹1,00,000; 2nd Prize — ₹50,000; 3rd Prize — ₹25,000.";
    }

    setCopilotMessages((previous) => [
      ...previous,
      { role: "assistant", text: answer },
    ]);
  };

  const updateField = (field: string, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleSkill = (skill: string) => {
    setSkills((previous) =>
      previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill]
    );
  };

  const findTeamMembers = async () => {
    setCopilotOpen(true);
    setShowTeamMatches(true);
    setTeamFinderError("");

    if (skills.length === 0) {
      setTeamFinderError("Select at least one skill first so we can find compatible teammates.");
      return;
    }

    setTeamFinderLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/participants`);
      if (!response.ok) throw new Error("Could not load registered participants.");

      const data = await response.json();
      const participants = Array.isArray(data?.participants) ? data.participants : [];
      const myEmail = form.email.trim().toLowerCase();

      const matches = participants
        .filter((person: any) => String(person.email || "").toLowerCase() !== myEmail)
        .map((person: any) => {
          const theirSkills = String(person.skills || "")
            .split(",")
            .map((x: string) => x.trim())
            .filter(Boolean);
          const lower = theirSkills.map((x: string) => x.toLowerCase());
          const matchedSkills = skills.filter((x) => lower.includes(x.toLowerCase()));
          const skillScore = skills.length ? (matchedSkills.length / skills.length) * 70 : 0;
          const domainScore = form.challenge_domain &&
            String(person.challenge_domain || "").toLowerCase() === form.challenge_domain.toLowerCase() ? 20 : 0;
          const experienceScore = form.experience_level &&
            String(person.experience_level || "").toLowerCase() === form.experience_level.toLowerCase() ? 10 : 0;
          return {
            ...person,
            compatibility: Math.min(99, Math.round(skillScore + domainScore + experienceScore)),
            matchedSkills,
          };
        })
        .filter((person: any) => person.compatibility > 0)
        .sort((a: any, b: any) => b.compatibility - a.compatibility)
        .slice(0, 8);

      setTeamMatches(matches);
      if (matches.length === 0) {
        setTeamFinderError("No compatible registered participants were found yet.");
      }
    } catch (err) {
      setTeamFinderError(err instanceof Error ? err.message : "Could not find team members.");
    } finally {
      setTeamFinderLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    if (skills.length === 0) {
      setError("Please select at least one skill.");
      setLoading(false);
      return;
    }

    if (!form.gender) {
      setError("Please select Male or Female.");
      setLoading(false);
      return;
    }

    if (!form.tshirt_size) {
      setError("Please select your T-shirt size.");
      setLoading(false);
      return;
    }

    if (!form.experience_level) {
      setError("Please select your experience level.");
      setLoading(false);
      return;
    }

    if (!form.team_option) {
      setError("Please select how you are participating.");
      setLoading(false);
      return;
    }

    if (
      form.team_option === "Team" &&
      !form.team_name.trim()
    ) {
      setError("Please enter your team name.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          skills: skills.join(", "),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Registration could not be completed."
        );
      }

      setSuccess(
        `Registration successful! Welcome, ${data.participant.full_name}.`
      );

      setForm(initialForm);
      setSkills([]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="register-page premium-success-page">
        <style>{`
          .premium-success-page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at 50% 42%, rgba(186,255,0,.10), transparent 24%),
              radial-gradient(circle at 15% 80%, rgba(186,255,0,.06), transparent 30%),
              #050505;
            color: #f4f4f4;
          }
          .premium-success-page::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
            background-size: 52px 52px;
            mask-image: linear-gradient(to bottom, black, transparent 92%);
            pointer-events: none;
          }
          .premium-success-page::after {
            content: "";
            position: absolute;
            width: 520px;
            height: 520px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(186,255,0,.10);
            border-radius: 50%;
            box-shadow: 0 0 90px rgba(186,255,0,.05), inset 0 0 90px rgba(186,255,0,.025);
            animation: premiumOrbitPulse 5s ease-in-out infinite;
            pointer-events: none;
          }
          .premium-success-nav {
            position: relative;
            z-index: 5;
            width: min(1180px, calc(100% - 48px));
            margin: 0 auto;
            padding: 30px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255,255,255,.10);
          }
          .premium-success-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: .16em;
          }
          .premium-success-mark {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            background: #baff00;
            color: #050505;
            font-size: 19px;
            box-shadow: 0 0 30px rgba(186,255,0,.18);
          }
          .premium-success-status {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #baff00;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .16em;
          }
          .premium-success-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #baff00;
            box-shadow: 0 0 14px rgba(186,255,0,.9);
            animation: premiumDotPulse 1.8s ease-in-out infinite;
          }
          .premium-success-main {
            position: relative;
            z-index: 3;
            min-height: calc(100vh - 100px);
            display: grid;
            place-items: center;
            padding: 58px 24px 80px;
          }
          .premium-success-orbit {
            position: absolute;
            left: 50%;
            top: 50%;
            width: min(650px, 80vw);
            aspect-ratio: 1;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(186,255,0,.12);
            border-radius: 50%;
            pointer-events: none;
          }
          .premium-success-orbit.one { animation: premiumRotate 18s linear infinite; }
          .premium-success-orbit.two {
            width: min(470px, 62vw);
            border-color: rgba(0,212,255,.10);
            animation: premiumRotateReverse 13s linear infinite;
          }
          .premium-success-card {
            width: min(720px, 100%);
            position: relative;
            padding: 54px 58px 46px;
            text-align: center;
            border: 1px solid rgba(186,255,0,.28);
            background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018)), rgba(4,4,4,.88);
            box-shadow: 0 35px 100px rgba(0,0,0,.60), 0 0 55px rgba(186,255,0,.07), inset 0 1px 0 rgba(255,255,255,.05);
            backdrop-filter: blur(18px);
            animation: premiumCardIn .65s cubic-bezier(.2,.8,.2,1) both;
          }
          .premium-success-card::before,
          .premium-success-card::after {
            content: "";
            position: absolute;
            width: 32px;
            height: 32px;
            border-color: #baff00;
            pointer-events: none;
          }
          .premium-success-card::before { left: -1px; top: -1px; border-left: 2px solid; border-top: 2px solid; }
          .premium-success-card::after { right: -1px; bottom: -1px; border-right: 2px solid; border-bottom: 2px solid; }
          .premium-success-check {
            width: 76px;
            height: 76px;
            margin: 0 auto 25px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(186,255,0,.7);
            background: rgba(186,255,0,.08);
            color: #baff00;
            font-size: 34px;
            font-weight: 300;
            box-shadow: 0 0 35px rgba(186,255,0,.12), inset 0 0 25px rgba(186,255,0,.06);
            animation: premiumCheckIn .8s .12s cubic-bezier(.2,.8,.2,1) both;
          }
          .premium-success-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #baff00;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .28em;
            animation: premiumFadeUp .6s .22s both;
          }
          .premium-success-label span { width: 34px; height: 1px; background: rgba(186,255,0,.45); }
          .premium-success-title {
            margin: 20px 0 14px;
            font-size: clamp(48px, 7vw, 78px);
            line-height: .94;
            letter-spacing: -.055em;
            font-weight: 900;
            animation: premiumFadeUp .65s .30s both;
          }
          .premium-success-title em { color: #baff00; font-style: normal; }
          .premium-success-copy {
            max-width: 530px;
            margin: 0 auto;
            color: #8d8d8d;
            font-size: 15px;
            line-height: 1.7;
            animation: premiumFadeUp .65s .40s both;
          }
          .premium-registration-ticket {
            width: min(430px, 100%);
            margin: 30px auto 22px;
            padding: 18px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            text-align: left;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.025);
            animation: premiumFadeUp .65s .48s both;
          }
          .premium-registration-ticket span {
            display: block;
            margin-bottom: 6px;
            color: #666;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: .18em;
          }
          .premium-registration-ticket strong { color: #f4f4f4; font-size: 22px; letter-spacing: .04em; }
          .premium-ticket-code { color: #baff00; font-size: 22px; font-weight: 900; letter-spacing: .08em; }
          .premium-success-list {
            width: min(430px, 100%);
            margin: 0 auto 28px;
            border-top: 1px solid rgba(255,255,255,.08);
            animation: premiumFadeUp .65s .56s both;
          }
          .premium-success-list > div {
            display: grid;
            grid-template-columns: 34px 1fr 24px;
            align-items: center;
            gap: 10px;
            padding: 13px 0;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,.08);
          }
          .premium-success-list > div > span { color: #555; font-size: 9px; font-weight: 900; }
          .premium-success-list p { margin: 0; color: #aaa; font-size: 11px; letter-spacing: .02em; }
          .premium-success-list b { color: #baff00; font-size: 13px; text-align: right; }
          .premium-success-action {
            width: min(430px, 100%);
            padding: 17px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 auto;
            border: 1px solid #baff00;
            background: #baff00;
            color: #050505;
            cursor: pointer;
            font: inherit;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .13em;
            transition: transform .2s ease, box-shadow .2s ease;
            animation: premiumFadeUp .65s .64s both;
          }
          .premium-success-action:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(186,255,0,.15); }
          @keyframes premiumCardIn { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes premiumCheckIn { from { opacity: 0; transform: scale(.65) rotate(-12deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
          @keyframes premiumFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes premiumRotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
          @keyframes premiumRotateReverse { from { transform: translate(-50%, -50%) rotate(360deg); } to { transform: translate(-50%, -50%) rotate(0deg); } }
          @keyframes premiumOrbitPulse { 0%,100% { opacity: .45; transform: translate(-50%, -50%) scale(.96); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.03); } }
          @keyframes premiumDotPulse { 0%,100% { opacity: .45; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }
          @media (max-width: 700px) {
            .premium-success-nav { width: calc(100% - 28px); padding: 20px 0; }
            .premium-success-status { font-size: 7px; }
            .premium-success-card { padding: 40px 22px 30px; }
            .premium-success-title { font-size: 48px; }
            .premium-success-copy { font-size: 13px; }
          }
        `}</style>

        <nav className="premium-success-nav">
          <div className="premium-success-brand">
            <span className="premium-success-mark">✦</span>
            <span>HACKATHON IQ</span>
          </div>
          <div className="premium-success-status">
            <span className="premium-success-dot" />
            REGISTRATION CONFIRMED
          </div>
        </nav>

        <section className="premium-success-main">
          <div className="premium-success-orbit one" />
          <div className="premium-success-orbit two" />

          <div className="premium-success-card">
            <div className="premium-success-check">✓</div>

            <div className="premium-success-label">
              <span />
              YOU'RE IN
              <span />
            </div>

            <h1 className="premium-success-title">
              Welcome to
              <br />
              <em>Hackathon IQ.</em>
            </h1>

            <p className="premium-success-copy">
              Your registration has been successfully received.
              Your place in the builder community is now secured.
            </p>

            {registrationId && (
              <div className="premium-registration-ticket">
                <div>
                  <span>REGISTRATION ID</span>
                  <strong>#{String(registrationId).padStart(4, "0")}</strong>
                </div>
                <div className="premium-ticket-code">H·IQ</div>
              </div>
            )}

            <div className="premium-success-list">
              <div>
                <span>01</span>
                <p>Participant profile created</p>
                <b>✓</b>
              </div>
              <div>
                <span>02</span>
                <p>Registration secured</p>
                <b>✓</b>
              </div>
              <div>
                <span>03</span>
                <p>You're ready to build</p>
                <b>✓</b>
              </div>
            </div>

            <button
              className="premium-success-action"
              type="button"
              onClick={() => {
                setSuccess(false);
                setRegistrationId(null);
              }}
            >
              REGISTER ANOTHER PARTICIPANT
              <span>↗</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="register-page">
      <div className="register-glow register-glow-one" />
      <div className="register-glow register-glow-two" />


        <style>{`
          .registration-copilot {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 100;
            font-family: inherit;
          }

          .copilot-trigger {
            border: 1px solid rgba(186, 255, 0, 0.7);
            background: #baff00;
            color: #050505;
            padding: 14px 18px;
            min-width: 150px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            cursor: pointer;
            font: inherit;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.12em;
            box-shadow: 0 12px 35px rgba(0,0,0,.35), 0 0 25px rgba(186,255,0,.12);
            transition: transform .2s ease, box-shadow .2s ease;
          }

          .copilot-trigger:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 42px rgba(0,0,0,.4), 0 0 35px rgba(186,255,0,.2);
          }

          .copilot-panel {
            width: min(360px, calc(100vw - 32px));
            height: 500px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(186,255,0,.35);
            background: rgba(8,8,8,.97);
            box-shadow: 0 25px 70px rgba(0,0,0,.55), 0 0 35px rgba(186,255,0,.08);
            backdrop-filter: blur(18px);
          }

          .copilot-header {
            padding: 16px 18px;
            border-bottom: 1px solid rgba(255,255,255,.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .copilot-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .copilot-orb {
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            background: #baff00;
            color: #050505;
            font-weight: 900;
          }

          .copilot-title strong {
            display: block;
            font-size: 12px;
            letter-spacing: .08em;
          }

          .copilot-title small {
            display: block;
            margin-top: 3px;
            color: #666;
            font-size: 10px;
          }

          .copilot-close {
            border: 0;
            background: transparent;
            color: #777;
            font-size: 20px;
            cursor: pointer;
          }

          .copilot-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .copilot-message {
            max-width: 88%;
            padding: 11px 13px;
            font-size: 12px;
            line-height: 1.55;
          }

          .copilot-message.user {
            align-self: flex-end;
            background: rgba(186,255,0,.12);
            border: 1px solid rgba(186,255,0,.25);
            color: #e9e9e9;
          }

          .copilot-message.assistant {
            align-self: flex-start;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.09);
            color: #aaa;
          }


          .copilot-team-action {
            margin: 12px 14px 0;
            padding: 13px;
            border: 1px solid rgba(186,255,0,.2);
            background: rgba(186,255,0,.04);
          }

          .copilot-team-action strong {
            display: block;
            color: #baff00;
            font-size: 10px;
            letter-spacing: .1em;
          }

          .copilot-team-action p {
            margin: 5px 0 10px;
            color: #777;
            font-size: 10px;
            line-height: 1.5;
          }

          .copilot-find-button {
            width: 100%;
            padding: 9px 10px;
            border: 0;
            background: #baff00;
            color: #050505;
            cursor: pointer;
            font: inherit;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .1em;
          }

          .copilot-find-button:disabled {
            opacity: .55;
            cursor: not-allowed;
          }

          .copilot-team-results {
            margin: 10px 14px 0;
            max-height: 190px;
            overflow-y: auto;
          }

          .copilot-results-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            color: #baff00;
            font-size: 9px;
            letter-spacing: .1em;
          }

          .copilot-results-title button {
            border: 0;
            background: transparent;
            color: #666;
            cursor: pointer;
            font-size: 8px;
          }

          .copilot-team-error,
          .copilot-team-empty {
            padding: 10px;
            border: 1px solid rgba(255,255,255,.08);
            color: #777;
            font-size: 10px;
            line-height: 1.5;
          }

          .copilot-match {
            padding: 10px;
            margin-bottom: 7px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.025);
          }

          .copilot-match-top {
            display: flex;
            justify-content: space-between;
            gap: 8px;
          }

          .copilot-match-top strong {
            display: block;
            color: #eee;
            font-size: 11px;
          }

          .copilot-match-top small {
            display: block;
            margin-top: 3px;
            color: #666;
            font-size: 8px;
          }

          .copilot-match-top b {
            color: #baff00;
            font-size: 12px;
          }

          .copilot-match-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 7px;
          }

          .copilot-match-skills span {
            padding: 3px 5px;
            border: 1px solid rgba(186,255,0,.15);
            color: #baff00;
            background: rgba(186,255,0,.04);
            font-size: 8px;
          }

          .copilot-match-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-top: 6px;
            color: #666;
            font-size: 8px;
          }

          .copilot-input-row {
            display: flex;
            gap: 8px;
            padding: 12px;
            border-top: 1px solid rgba(255,255,255,.1);
          }

          .copilot-input {
            min-width: 0;
            flex: 1;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.03);
            color: #eee;
            padding: 12px;
            outline: none;
            font: inherit;
            font-size: 12px;
          }

          .copilot-input:focus {
            border-color: rgba(186,255,0,.6);
          }

          .copilot-send {
            width: 46px;
            border: 0;
            background: #baff00;
            color: #050505;
            cursor: pointer;
            font-weight: 900;
            font-size: 17px;
          }

          .team-finder {
            position: fixed;
            right: 24px;
            bottom: 92px;
            z-index: 101;
            width: min(430px, calc(100vw - 32px));
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(186,255,0,.35);
            background: rgba(8,8,8,.97);
            box-shadow: 0 25px 70px rgba(0,0,0,.55), 0 0 35px rgba(186,255,0,.08);
            backdrop-filter: blur(18px);
          }
          .team-finder-header { padding: 17px 18px; border-bottom: 1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:space-between; }
          .team-finder-title { display:flex; align-items:center; gap:10px; }
          .team-finder-icon { width:30px; height:30px; display:grid; place-items:center; background:#baff00; color:#050505; font-weight:900; }
          .team-finder-title strong { display:block; font-size:12px; letter-spacing:.08em; }
          .team-finder-title small { display:block; margin-top:3px; color:#666; font-size:10px; }
          .team-finder-close { border:0; background:transparent; color:#777; font-size:20px; cursor:pointer; }
          .team-finder-content { overflow-y:auto; padding:14px; }
          .team-finder-note { margin:0 0 12px; color:#777; font-size:11px; line-height:1.5; }
          .team-finder-error { padding:12px; border:1px solid rgba(255,80,80,.3); background:rgba(255,50,50,.05); color:#c9c9c9; font-size:11px; line-height:1.5; }
          .team-finder-empty { padding:22px 12px; text-align:center; color:#666; font-size:12px; line-height:1.6; }
          .team-match { padding:15px; margin-bottom:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.025); transition:border-color .2s, transform .2s; }
          .team-match:hover { transform:translateY(-2px); border-color:rgba(186,255,0,.4); }
          .team-match-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
          .team-match-name { font-size:14px; font-weight:800; color:#eee; }
          .team-match-college { margin-top:4px; color:#666; font-size:10px; }
          .team-match-score { flex-shrink:0; color:#baff00; font-size:14px; font-weight:900; }
          .team-match-skills { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
          .team-match-skill { padding:5px 8px; border:1px solid rgba(186,255,0,.2); color:#baff00; background:rgba(186,255,0,.05); font-size:9px; }
          .team-match-meta { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; color:#777; font-size:9px; }
          .team-finder-run { width:100%; margin-top:10px; padding:12px; border:0; background:#baff00; color:#050505; cursor:pointer; font:inherit; font-size:10px; font-weight:900; letter-spacing:.1em; }
          .team-finder-run:disabled { opacity:.55; cursor:not-allowed; }

          @media (max-width: 600px) {
            .registration-copilot {
              right: 12px;
              bottom: 12px;
            }

            .copilot-panel {
              height: min(500px, calc(100vh - 90px));
            }
          }
        `}</style>

      <section className="register-shell">

        {/* HEADER */}
        <header className="register-header">

          <div className="brand-row">
            <div className="brand-mark">✦</div>

            <div>
              <div className="brand-small">
                HACKATHON IQ
              </div>

              <div className="brand-subtitle">
                Build. Match. Innovate.
              </div>
            </div>
          </div>

          <div className="event-meta">

            <div className="event-meta-item">
              <span>DATE</span>
              <strong>15–16 OCTOBER 2026</strong>
            </div>

            <div className="event-meta-divider" />

            <div className="event-meta-item">
              <span>LOCATION</span>
              <strong>
                CORNER STONE IT SOLUTIONS · HYDERABAD
              </strong>
            </div>

          </div>
        </header>


        {/* INTRO */}
        <section className="register-intro">

          <p className="eyebrow">
            PARTICIPANT REGISTRATION
          </p>

          <h1>
            Join the
            <span> Hackathon.</span>
          </h1>

          <p className="intro-text">
            Tell us about yourself, choose your skills,
            and find the right people to build with.
          </p>

        </section>


        {/* ERROR */}
        {error && (
          <div className="status-card error-card">
            <div className="status-icon">!</div>

            <div>
              <strong>REGISTRATION COULDN'T BE COMPLETED</strong>
              <p>{error}</p>
            </div>
          </div>
        )}


        <form
          className="registration-form"
          onSubmit={handleSubmit}
        >

          {/* PERSONAL */}
          <section className="form-section">

            <div className="section-heading">
              <span>01</span>

              <div>
                <h2>Personal details</h2>
                <p>Let's get to know you.</p>
              </div>
            </div>


            <div className="form-grid">

              <label className="field field-full">
                <span>FULL NAME <b className="required-star">*</b></span>

                <input
                  value={form.full_name}
                  onChange={(e) =>
                    updateField("full_name", e.target.value)
                  }
                  placeholder="Your full name"
                  required
                />
              </label>


              <label className="field">
                <span>EMAIL <b className="required-star">*</b></span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>


              <label className="field">
                <span>PHONE <b className="required-star">*</b></span>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </label>


              <div className="field">
                <span>GENDER <b className="required-star">*</b></span>

                <div className="choice-row">

                  {["Male", "Female"].map((gender) => (
                    <button
                      type="button"
                      key={gender}
                      className={
                        form.gender === gender
                          ? "choice-button selected"
                          : "choice-button"
                      }
                      onClick={() =>
                        updateField("gender", gender)
                      }
                    >
                      {gender}
                    </button>
                  ))}

                </div>
              </div>


              <label className="field">
                <span>COLLEGE / UNIVERSITY <b className="required-star">*</b></span>

                <input
                  value={form.college}
                  onChange={(e) =>
                    updateField("college", e.target.value)
                  }
                  placeholder="Your institution"
                  required
                />
              </label>


              <label className="field">
                <span>CITY <b className="required-star">*</b></span>

                <input
                  value={form.city}
                  onChange={(e) =>
                    updateField("city", e.target.value)
                  }
                  placeholder="Hyderabad"
                  required
                />
              </label>

            </div>
          </section>


          {/* TEAM */}
          <section className="form-section">

            <div className="section-heading">
              <span>02</span>

              <div>
                <h2>Build your team</h2>
                <p>Choose how you want to participate.</p>
              </div>
            </div>


            <div className="team-grid">

              {TEAM_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={
                    form.team_option === option.value
                      ? "team-card selected"
                      : "team-card"
                  }
                  onClick={() =>
                    updateField(
                      "team_option",
                      option.value
                    )
                  }
                >
                  <div className="team-card-top">
                    <span className="team-dot">
                      {form.team_option === option.value
                        ? "✓"
                        : ""}
                    </span>

                    <span>↗</span>
                  </div>

                  <strong>{option.title}</strong>

                  <p>{option.description}</p>
                </button>
              ))}

            </div>


            {form.team_option === "Team" && (
              <label className="field team-name-field">
                <span>TEAM NAME</span>

                <input
                  value={form.team_name}
                  onChange={(e) =>
                    updateField(
                      "team_name",
                      e.target.value
                    )
                  }
                  placeholder="Enter your team name"
                  required
                />
              </label>
            )}

          </section>


          {/* SOCIAL */}
          <section className="form-section">

            <div className="section-heading">
              <span>03</span>

              <div>
                <h2>Online presence</h2>
                <p>Optional, but useful for your teammates.</p>
              </div>
            </div>


            <div className="form-grid">

              <label className="field">
                <span>GITHUB</span>

                <input
                  value={form.github}
                  onChange={(e) =>
                    updateField("github", e.target.value)
                  }
                  placeholder="github.com/username"
                />
              </label>


              <label className="field">
                <span>LINKEDIN</span>

                <input
                  value={form.linkedin}
                  onChange={(e) =>
                    updateField("linkedin", e.target.value)
                  }
                  placeholder="linkedin.com/in/username"
                />
              </label>

            </div>

          </section>


          {/* EVENT */}
          <section className="form-section">

            <div className="section-heading">
              <span>04</span>

              <div>
                <h2>Event profile</h2>
                <p>Help us prepare for you.</p>
              </div>
            </div>


            {/* T-SHIRT */}
            <div className="field">
              <span>T-SHIRT SIZE</span>

              <div className="size-grid">

                {TSHIRT_SIZES.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={
                      form.tshirt_size === size
                        ? "size-button selected"
                        : "size-button"
                    }
                    onClick={() =>
                      updateField("tshirt_size", size)
                    }
                  >
                    {size}
                  </button>
                ))}

              </div>
            </div>


            {/* EXPERIENCE */}
            <div className="field experience-field">
              <span>EXPERIENCE LEVEL</span>

              <div className="experience-grid">

                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={
                      form.experience_level === level
                        ? "experience-card selected"
                        : "experience-card"
                    }
                    onClick={() =>
                      updateField(
                        "experience_level",
                        level
                      )
                    }
                  >
                    <strong>{level}</strong>

                    <small>
                      {level === "Beginner"
                        ? "Starting my journey"
                        : level === "Intermediate"
                        ? "I've built projects"
                        : "I build confidently"}
                    </small>
                  </button>
                ))}

              </div>
            </div>

          </section>


          {/* SKILLS */}
          <section className="form-section">

            <div className="section-heading">
              <span>05</span>

              <div>
                <h2>Your skills</h2>
                <p>Select everything you can contribute.</p>
              </div>
            </div>


            <div className="skills-topline">
              <span>
                {skillCount} skill
                {skillCount !== 1 ? "s" : ""} selected
              </span>

              {skillCount > 0 && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => setSkills([])}
                >
                  CLEAR
                </button>
              )}
            </div>


            <div className="skills-grid">

              {SKILLS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className={
                    skills.includes(skill)
                      ? "skill-chip selected"
                      : "skill-chip"
                  }
                  onClick={() => toggleSkill(skill)}
                >
                  <span>
                    {skills.includes(skill) ? "✓" : "+"}
                  </span>

                  {skill}
                </button>
              ))}

            </div>

          </section>


          {/* HACKATHON */}
          <section className="form-section">

            <div className="section-heading">
              <span>06</span>

              <div>
                <h2>Your idea</h2>
                <p>What do you want to build?</p>
              </div>
            </div>


            <div className="form-grid">

              <label className="field field-full">
                <span>CHALLENGE / DOMAIN</span>

                <select
                  value={form.challenge_domain}
                  onChange={(e) =>
                    updateField(
                      "challenge_domain",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a domain
                  </option>

                  {DOMAINS.map((domain) => (
                    <option
                      value={domain}
                      key={domain}
                    >
                      {domain}
                    </option>
                  ))}
                </select>
              </label>


              <label className="field field-full">

                <span>PROJECT IDEA</span>

                <textarea
                  value={form.idea}
                  onChange={(e) =>
                    updateField("idea", e.target.value)
                  }
                  placeholder="Tell us briefly what you want to build..."
                  rows={6}
                />

              </label>

            </div>

          </section>


          {/* SUBMIT */}
          <section className="submit-section">

            <div className="submit-info">
              <span className="pulse-dot" />

              <div>
                <strong>SECURE SUBMISSION</strong>

                <p>
                  Your registration is securely
                  submitted to Hackathon IQ.
                </p>
              </div>
            </div>


            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >

              {loading
                ? "SUBMITTING..."
                : "COMPLETE REGISTRATION"}

              <span>↗</span>

            </button>

          </section>

        </form>

      </section>

      <div className="registration-copilot">
        {copilotOpen && (
          <div className="copilot-panel">
            <div className="copilot-header">
              <div className="copilot-title">
                <div className="copilot-orb">✦</div>
                <div>
                  <strong>HACKATHON COPILOT</strong>
                  <small>Your registration assistant</small>
                </div>
              </div>

              <button
                type="button"
                className="copilot-close"
                onClick={() => setCopilotOpen(false)}
                aria-label="Close Copilot"
              >
                ×
              </button>
            </div>

            <div className="copilot-team-action">
              <div>
                <strong>👥 FIND TEAMMATES</strong>
                <p>
                  Find compatible registered participants using
                  your selected skills, experience, and domain.
                </p>
              </div>

              <button
                type="button"
                className="copilot-find-button"
                onClick={() => void findTeamMembers()}
                disabled={teamFinderLoading}
              >
                {teamFinderLoading ? "FINDING..." : "FIND TEAMMATES"}
              </button>
            </div>

            {showTeamMatches && (
              <div className="copilot-team-results">
                <div className="copilot-results-title">
                  <strong>TEAMMATE MATCHES</strong>
                  <button
                    type="button"
                    onClick={() => setShowTeamMatches(false)}
                  >
                    HIDE
                  </button>
                </div>

                {teamFinderError && (
                  <div className="copilot-team-error">
                    {teamFinderError}
                  </div>
                )}

                {!teamFinderLoading &&
                  !teamFinderError &&
                  teamMatches.length === 0 && (
                    <div className="copilot-team-empty">
                      Select at least one skill and click
                      <strong> FIND TEAMMATES</strong>.
                    </div>
                  )}

                {!teamFinderLoading &&
                  teamMatches.map((match) => (
                    <div
                      className="copilot-match"
                      key={String(match.participant_id)}
                    >
                      <div className="copilot-match-top">
                        <div>
                          <strong>{match.full_name}</strong>
                          <small>
                            {match.college || "College not provided"}
                            {match.city ? ` · ${match.city}` : ""}
                          </small>
                        </div>

                        <b>{match.compatibility}%</b>
                      </div>

                      {match.matched_skills.length > 0 && (
                        <div className="copilot-match-skills">
                          {match.matched_skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      )}

                      <div className="copilot-match-meta">
                        {match.experience_level && (
                          <span>{match.experience_level}</span>
                        )}
                        {match.challenge_domain && (
                          <span>{match.challenge_domain}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="copilot-messages">
              {copilotMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`copilot-message ${message.role}`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <form
              className="copilot-input-row"
              onSubmit={(event) => {
                event.preventDefault();
                void askCopilot();
              }}
            >
              <input
                className="copilot-input"
                value={copilotInput}
                onChange={(event) =>
                  setCopilotInput(event.target.value)
                }
                placeholder="Ask Copilot anything..."
                aria-label="Ask Hackathon Copilot"
              />

              <button
                type="submit"
                className="copilot-send"
                aria-label="Send question"
              >
                ↗
              </button>
            </form>
          </div>
        )}

        {!copilotOpen && (
          <button
            type="button"
            className="copilot-trigger"
            onClick={() => setCopilotOpen(true)}
          >
            <span>✦ ASK COPILOT</span>
            <span>↗</span>
          </button>
        )}
      </div>



    </main>
  );
}
