import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import "./App.css";
import Register from "./Register";
import AIAssistant from "./AIAssistant";


/* ============================================================
   HACKATHON IQ — PREMIUM VISUAL ENGINE
   ============================================================ */

function VisualFX() {
  return (
    <>
      <style>{`

        /* ======================================================
           GLOBAL FX
           ====================================================== */

        .hq-fx {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(200,255,0,.09),
              transparent 23%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(91,33,182,.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 50% 80%,
              rgba(0,229,255,.06),
              transparent 28%
            );
        }


        /* ======================================================
           GRID
           ====================================================== */

        .hq-grid {
          position: absolute;

          width: 1300px;
          height: 800px;

          left: 50%;
          bottom: -500px;

          transform:
            translateX(-50%)
            perspective(650px)
            rotateX(64deg);

          background-image:
            linear-gradient(
              rgba(200,255,0,.075) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(200,255,0,.075) 1px,
              transparent 1px
            );

          background-size: 55px 55px;

          mask-image:
            linear-gradient(
              to top,
              black,
              transparent
            );

          animation:
            hqGridMove 5s linear infinite;
        }

        @keyframes hqGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 0 55px;
          }
        }


        /* ======================================================
           LIGHT BLOBS
           ====================================================== */

        .hq-blob {
          position: absolute;

          border-radius: 50%;

          filter: blur(85px);

          opacity: .20;

          animation:
            hqBlobMove 12s ease-in-out infinite;
        }

        .hq-blob-one {
          width: 330px;
          height: 330px;

          left: -120px;
          top: 20%;

          background: #c8ff00;
        }

        .hq-blob-two {
          width: 280px;
          height: 280px;

          right: -100px;
          top: 25%;

          background: #7c3aed;

          animation-delay: -4s;
        }

        .hq-blob-three {
          width: 220px;
          height: 220px;

          left: 45%;
          bottom: -100px;

          background: #00e5ff;

          animation-delay: -8s;
        }

        @keyframes hqBlobMove {

          0%,
          100% {
            transform:
              translate3d(0,0,0)
              scale(1);
          }

          50% {
            transform:
              translate3d(40px,-45px,0)
              scale(1.15);
          }
        }


        /* ======================================================
           PARTICLES
           ====================================================== */

        .hq-particle {
          position: absolute;

          width: 3px;
          height: 3px;

          border-radius: 50%;

          background: #c8ff00;

          box-shadow:
            0 0 8px #c8ff00,
            0 0 18px rgba(200,255,0,.5);

          animation:
            hqParticleFloat 5s ease-in-out infinite;
        }

        .p1 {
          left: 8%;
          top: 22%;
        }

        .p2 {
          left: 19%;
          top: 63%;
          animation-delay: -1s;
        }

        .p3 {
          left: 33%;
          top: 16%;
          animation-delay: -2s;
        }

        .p4 {
          left: 52%;
          top: 28%;
          background: #00e5ff;
          box-shadow: 0 0 15px #00e5ff;
          animation-delay: -3s;
        }

        .p5 {
          left: 72%;
          top: 17%;
          background: #a855f7;
          box-shadow: 0 0 15px #a855f7;
          animation-delay: -1.5s;
        }

        .p6 {
          left: 88%;
          top: 56%;
          animation-delay: -4s;
        }

        .p7 {
          left: 64%;
          top: 72%;
          background: #ff4ecd;
          box-shadow: 0 0 15px #ff4ecd;
          animation-delay: -2.5s;
        }

        .p8 {
          left: 43%;
          top: 78%;
          animation-delay: -3.5s;
        }

        @keyframes hqParticleFloat {

          0%,
          100% {
            transform:
              translate3d(0,0,0)
              scale(.7);

            opacity: .15;
          }

          50% {
            transform:
              translate3d(0,-40px,0)
              scale(1.5);

            opacity: 1;
          }
        }


        /* ======================================================
           CROSSHAIR
           ====================================================== */

        .hq-crosshair {
          position: absolute;

          width: 260px;
          height: 260px;

          left: 52%;
          top: 35%;

          transform: translate(-50%,-50%);

          border:
            1px solid
            rgba(200,255,0,.08);

          border-radius: 50%;

          animation:
            hqCrosshairSpin 20s linear infinite;
        }

        .hq-crosshair::before,
        .hq-crosshair::after {
          content: "";

          position: absolute;

          left: 50%;
          top: 50%;

          background:
            rgba(200,255,0,.08);

          transform:
            translate(-50%,-50%);
        }

        .hq-crosshair::before {
          width: 100%;
          height: 1px;
        }

        .hq-crosshair::after {
          width: 1px;
          height: 100%;
        }

        @keyframes hqCrosshairSpin {
          from {
            transform:
              translate(-50%,-50%)
              rotate(0deg);
          }

          to {
            transform:
              translate(-50%,-50%)
              rotate(360deg);
          }
        }


        /* ======================================================
           PREMIUM 3D CUBE
           ====================================================== */

        .hq-cube-scene {
          position: absolute;

          right: 8%;
          top: 18%;

          width: 150px;
          height: 150px;

          perspective: 900px;

          opacity: .75;
        }

        .hq-cube {
          width: 100%;
          height: 100%;

          position: relative;

          transform-style: preserve-3d;

          animation:
            hqCubeRotate 16s linear infinite;
        }

        .hq-face {
          position: absolute;

          inset: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(200,255,0,.45);

          background:
            linear-gradient(
              135deg,
              rgba(200,255,0,.08),
              rgba(139,92,246,.05)
            );

          backdrop-filter: blur(10px);

          color: #c8ff00;

          font-size: 22px;

          font-weight: 900;

          letter-spacing: -1px;

          box-shadow:
            inset 0 0 35px
            rgba(200,255,0,.04),
            0 0 30px
            rgba(200,255,0,.05);
        }

        .face-front {
          transform:
            translateZ(75px);
        }

        .face-back {
          transform:
            rotateY(180deg)
            translateZ(75px);
        }

        .face-left {
          transform:
            rotateY(-90deg)
            translateZ(75px);
        }

        .face-right {
          transform:
            rotateY(90deg)
            translateZ(75px);
        }

        .face-top {
          transform:
            rotateX(90deg)
            translateZ(75px);
        }

        .face-bottom {
          transform:
            rotateX(-90deg)
            translateZ(75px);
        }

        @keyframes hqCubeRotate {

          0% {
            transform:
              rotateX(-14deg)
              rotateY(0deg);
          }

          100% {
            transform:
              rotateX(-14deg)
              rotateY(360deg);
          }
        }


        /* ======================================================
           HERO BRAND TEXT
           ====================================================== */

        .hq-brand {
          position: relative;

          display: inline-block;
        }

        .hq-brand::before {
          content: "";

          position: absolute;

          left: -20px;
          right: -20px;

          bottom: -8px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #c8ff00,
              transparent
            );

          opacity: .45;
        }

        .hero-content h1 {
          text-shadow:
            0 0 50px
            rgba(200,255,0,.04);
        }

        .hero-content h1 span {
          position: relative;

          background:
            linear-gradient(
              90deg,
              #c8ff00,
              #eaff9c,
              #00e5ff,
              #a855f7,
              #c8ff00
            );

          background-size:
            350% auto;

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;

          animation:
            hqGradientMove 7s linear infinite;
        }

        @keyframes hqGradientMove {

          to {
            background-position:
              350% center;
          }
        }


        /* ======================================================
           SCAN LINE
           ====================================================== */

        .hq-scan {
          position: absolute;

          left: 0;
          right: 0;

          height: 1px;

          top: 0;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(200,255,0,.5),
              transparent
            );

          opacity: .35;

          animation:
            hqScan 6s linear infinite;
        }

        @keyframes hqScan {

          0% {
            transform:
              translateY(-20px);
          }

          100% {
            transform:
              translateY(100vh);
          }
        }


        /* ======================================================
           FLOATING TECH LABELS
           ====================================================== */

        .hq-tech-label {
          position: absolute;

          padding:
            8px 12px;

          border:
            1px solid
            rgba(200,255,0,.18);

          background:
            rgba(5,5,5,.55);

          backdrop-filter:
            blur(12px);

          color:
            rgba(255,255,255,.55);

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 2px;

          animation:
            hqLabelFloat 5s ease-in-out infinite;
        }

        .tech-one {
          left: 8%;
          top: 37%;
        }

        .tech-two {
          right: 6%;
          top: 48%;
          animation-delay: -2s;
        }

        .tech-three {
          left: 18%;
          bottom: 22%;
          animation-delay: -3s;
        }

        @keyframes hqLabelFloat {

          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-10px);
          }
        }


        /* ======================================================
           BUTTON ENERGY
           ====================================================== */

        .primary-button,
        .nav-register,
        .ai-button {

          position: relative;

          overflow: hidden;

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .primary-button:hover,
        .nav-register:hover,
        .ai-button:hover {

          transform:
            translateY(-3px);

          box-shadow:
            0 0 30px
            rgba(200,255,0,.25),
            0 15px 50px
            rgba(0,0,0,.35);
        }

        .primary-button::after,
        .nav-register::after,
        .ai-button::after {

          content: "";

          position: absolute;

          top: 0;

          left: -120%;

          width: 70%;

          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.6),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left .65s ease;
        }

        .primary-button:hover::after,
        .nav-register:hover::after,
        .ai-button:hover::after {

          left: 140%;
        }


        /* ======================================================
           AI WINDOW GLOW
           ====================================================== */

        .ai-window {

          box-shadow:
            0 0 0 1px
            rgba(200,255,0,.08),
            0 20px 90px
            rgba(0,0,0,.35);
        }

        .ai-window::after {

          content: "";

          position: absolute;

          width: 200px;
          height: 200px;

          right: -100px;
          bottom: -100px;

          border-radius: 50%;

          background:
            #7c3aed;

          filter:
            blur(90px);

          opacity: .12;

          pointer-events: none;
        }


        /* ======================================================
           MOBILE
           ====================================================== */

        @media (max-width: 700px) {

          .hq-cube-scene {
            right: -15px;
            top: 12%;
            transform: scale(.55);
            opacity: .35;
          }

          .hq-crosshair {
            width: 180px;
            height: 180px;
          }

          .hq-grid {
            width: 700px;
          }

          .hq-tech-label {
            display: none;
          }
        }

      `}</style>


      <div className="hq-fx">

        <div className="hq-blob hq-blob-one" />
        <div className="hq-blob hq-blob-two" />
        <div className="hq-blob hq-blob-three" />

        <div className="hq-grid" />

        <div className="hq-crosshair" />

        <div className="hq-scan" />


        {/* PARTICLES */}

        <span className="hq-particle p1" />
        <span className="hq-particle p2" />
        <span className="hq-particle p3" />
        <span className="hq-particle p4" />
        <span className="hq-particle p5" />
        <span className="hq-particle p6" />
        <span className="hq-particle p7" />
        <span className="hq-particle p8" />


        {/* 3D CUBE */}

        <div className="hq-cube-scene">

          <div className="hq-cube">

            <div className="hq-face face-front">
              IQ
            </div>

            <div className="hq-face face-back">
              ✦
            </div>

            <div className="hq-face face-left">
              AI
            </div>

            <div className="hq-face face-right">
              IQ
            </div>

            <div className="hq-face face-top">
              ✦
            </div>

            <div className="hq-face face-bottom">
              AI
            </div>

          </div>

        </div>


        {/* FLOATING LABELS */}

        <div className="hq-tech-label tech-one">
          AI / BUILD / SHIP
        </div>

        <div className="hq-tech-label tech-two">
          SYSTEM // 026
        </div>

        <div className="hq-tech-label tech-three">
          INNOVATION ACTIVE
        </div>

      </div>
    </>
  );
}


/* ============================================================
   HOME
   ============================================================ */

function Home() {

  const navigate = useNavigate();

  const [time, setTime] = useState({
    days: 61,
    hours: 22,
    minutes: 37,
    seconds: 55,
  });


  useEffect(() => {

    const timer = setInterval(() => {

      setTime((prev) => {

        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds:
              prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes:
              prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            ...prev,
            hours:
              prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        if (prev.days > 0) {
          return {
            days:
              prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }

        return prev;
      });

    }, 1000);

    return () =>
      clearInterval(timer);

  }, []);


  const scrollTo = (id: string) => {

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });

  };


  return (

    <div className="site">

      <VisualFX />


      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >

          <span className="logo-box">
            IQ
          </span>

          <div className="logo-name">

            <strong>
              HACKATHON
            </strong>

            <strong>
              IQ
            </strong>

          </div>

        </div>


        <nav>

          <button
            onClick={() =>
              scrollTo("about")
            }
          >
            ABOUT
          </button>

          <button
            onClick={() =>
              scrollTo("challenges")
            }
          >
            CHALLENGES
          </button>

          <button
            onClick={() =>
              scrollTo("prizes")
            }
          >
            PRIZES
          </button>

          <button
            onClick={() =>
              scrollTo("schedule")
            }
          >
            SCHEDULE
          </button>

        </nav>


        <button
          className="nav-register"
          onClick={() =>
            navigate("/register")
          }
        >
          REGISTER
          <span>↗</span>
        </button>

      </header>


      {/* ======================================================
          HERO
          ====================================================== */}

      <main className="hero">

        <div className="hero-background">

          <div className="grid" />

          <div className="orb orb-one" />

          <div className="orb orb-two" />

        </div>


        <div className="hero-content">

          <div className="edition">

            <span />

            2026 EDITION

          </div>


          <div className="hq-brand">

            <h1>

              HACKATHON

              <br />

              <span>
                IQ
              </span>

            </h1>

          </div>


          <div className="hero-bottom">

            <div className="hero-description">

              <p className="eyebrow">

                INDIA'S NEXT GENERATION

                <br />

                OF BUILDERS

              </p>


              <p className="description">

                A high-intensity innovation
                experience where bold ideas
                become real-world technology.

              </p>

            </div>


            <div className="hero-date">

              <span>
                15 — 16
              </span>

              <div>

                OCTOBER

                <br />

                2026

              </div>

            </div>


            <div className="hero-location">

              <span>
                LOCATION
              </span>

              <strong>
                HYDERABAD
              </strong>

              <small>
                INDIA
              </small>

            </div>

          </div>


          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={() =>
                navigate("/register")
              }
            >

              REGISTER FOR HACKATHON

              <span>
                ↗
              </span>

            </button>


            <button
              className="secondary-button"
              onClick={() =>
                scrollTo("about")
              }
            >

              EXPLORE HACKATHON

              <span>
                ↓
              </span>

            </button>

          </div>

        </div>


        {/* ====================================================
            HERO ART
            ==================================================== */}

        <div className="hero-art">

          <div className="art-ring ring-one" />

          <div className="art-ring ring-two" />

          <div className="art-ring ring-three" />


          <div className="art-core">

            <div className="core-top">

              HACKATHON

              <span>
                IQ
              </span>

            </div>


            <div className="core-number">
              26
            </div>


            <div className="core-bottom">

              CREATE
              <br />

              SOMETHING
              <br />

              WORTH REMEMBERING

            </div>

          </div>


          <div className="floating-label label-one">

            <span>
              01
            </span>

            IDEA

          </div>


          <div className="floating-label label-two">

            <span>
              02
            </span>

            BUILD

          </div>


          <div className="floating-label label-three">

            <span>
              03
            </span>

            SHIP

          </div>

        </div>


        {/* ====================================================
            COUNTDOWN
            ==================================================== */}

        <div className="countdown">

          <div className="countdown-title">

            HACKATHON BEGINS IN

          </div>


          <div className="countdown-values">

            <div>

              <strong>
                {String(time.days).padStart(2, "0")}
              </strong>

              <span>
                DAYS
              </span>

            </div>


            <b>
              :
            </b>


            <div>

              <strong>
                {String(time.hours).padStart(2, "0")}
              </strong>

              <span>
                HRS
              </span>

            </div>


            <b>
              :
            </b>


            <div>

              <strong>
                {String(time.minutes).padStart(2, "0")}
              </strong>

              <span>
                MIN
              </span>

            </div>


            <b>
              :
            </b>


            <div>

              <strong>
                {String(time.seconds).padStart(2, "0")}
              </strong>

              <span>
                SEC
              </span>

            </div>

          </div>

        </div>


        {/* ====================================================
            STATS
            ==================================================== */}

        <div className="hero-stats">

          <div>

            <span>
              01 / FIRST PRIZE
            </span>

            <strong>
              ₹1,00,000
            </strong>

          </div>


          <div>

            <span>
              02 / SECOND PRIZE
            </span>

            <strong>
              ₹50,000
            </strong>

          </div>


          <div>

            <span>
              03 / THIRD PRIZE
            </span>

            <strong>
              ₹25,000
            </strong>

          </div>

        </div>

      </main>


      {/* ======================================================
          ABOUT
          ====================================================== */}

      <section
        id="about"
        className="intro"
      >

        <div className="section-number">
          01
        </div>


        <div className="intro-content">

          <p className="eyebrow">
            WHY HACKATHON IQ
          </p>


          <h2>

            Not another

            <br />

            <span>
              hackathon.
            </span>

          </h2>


          <p className="intro-text">

            Hackathon IQ brings together
            ambitious builders, designers,
            developers and problem-solvers
            to turn unconventional ideas
            into working products.

          </p>

        </div>

      </section>


      {/* ======================================================
          AI
          ====================================================== */}

      <section className="ai-teaser">

        <div className="ai-copy">

          <p className="eyebrow">
            POWERED BY AI
          </p>


          <h2>

            Your idea.

            <br />

            <span>
              Sharper.
            </span>

          </h2>


          <p>

            Meet Hackathon IQ Copilot —
            an AI assistant trained on the
            hackathon's rules, challenges,
            schedule and resources.

          </p>


          <button
            className="ai-button"
            onClick={() =>
              navigate("/ai")
            }
          >

            ASK AI COPILOT

            <span>
              ↗
            </span>

          </button>

        </div>


        <div className="ai-window">

          <div className="window-top">

            <span>
              HACKATHON IQ / COPILOT
            </span>


            <div>

              <i />
              <i />
              <i />

            </div>

          </div>


          <div className="chat-question">

            <span>
              YOU
            </span>


            <p>

              Can I participate
              without a team?

            </p>

          </div>


          <div className="chat-answer">

            <div className="ai-icon">
              IQ
            </div>


            <div>

              <span>
                HACKATHON IQ
              </span>


              <p>

                No. Teams must contain
                2–4 members. Individual
                participation is not allowed.

              </p>


              <small>

                SOURCE · HACKATHON RULES

              </small>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          CHALLENGES
          ====================================================== */}

      <section
        id="challenges"
        className="simple-section"
      >

        <p className="eyebrow">
          02 / CHALLENGES
        </p>


        <h2>

          Choose what

          <br />

          <span>
            you want to change.
          </span>

        </h2>


        <div className="challenge-row">

          <div>

            <span>
              01
            </span>

            <strong>
              AI & MACHINE LEARNING
            </strong>

          </div>


          <div>

            <span>
              02
            </span>

            <strong>
              CLIMATE & SUSTAINABILITY
            </strong>

          </div>


          <div>

            <span>
              03
            </span>

            <strong>
              FINTECH & FUTURE ECONOMY
            </strong>

          </div>


          <div>

            <span>
              04
            </span>

            <strong>
              OPEN INNOVATION
            </strong>

          </div>

        </div>

      </section>


      {/* ======================================================
          REGISTER
          ====================================================== */}

      <section
        id="register"
        className="register-section"
      >

        <p className="eyebrow">
          03 / REGISTRATION
        </p>


        <h2>

          Ready to

          <br />

          <span>
            build?
          </span>

        </h2>


        <button
          className="primary-button"
          onClick={() =>
            navigate("/register")
          }
        >

          START REGISTRATION

          <span>
            ↗
          </span>

        </button>

      </section>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer>

        <div className="logo">

          <span className="logo-box">
            IQ
          </span>


          <div className="logo-name">

            <strong>
              HACKATHON
            </strong>

            <strong>
              IQ
            </strong>

          </div>

        </div>


        <span>
          HYDERABAD · INDIA · 2026
        </span>

      </footer>

    </div>
  );
}


/* ============================================================
   ROUTER
   ============================================================ */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/ai"
          element={<AIAssistant />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;
