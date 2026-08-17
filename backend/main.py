import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from database import get_connection
from rag_engine import ask_hackathon_ai


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("hackathon-iq")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Hackathon IQ API",
    description="AI-powered hackathon registration and intelligence platform",
    version="2.0.0",
)


# ============================================================
# REQUEST LOGGING MIDDLEWARE
# ============================================================

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(
        "REQUEST | %s %s",
        request.method,
        request.url.path,
    )

    try:
        response = await call_next(request)

        logger.info(
            "RESPONSE | %s %s | status=%s",
            request.method,
            request.url.path,
            response.status_code,
        )

        return response

    except Exception:
        logger.exception(
            "REQUEST ERROR | %s %s",
            request.method,
            request.url.path,
        )
        raise


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://hackathon-iq-sigma.vercel.app",
        "https://hackathon-cxddqzc1h-sanju-team.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class RegistrationRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=30)
    college: str = Field(..., min_length=2, max_length=300)
    city: str = Field(..., min_length=2, max_length=100)
    skills: Optional[str] = Field(default="", max_length=2000)
    team_option: str = Field(..., min_length=2, max_length=50)
    team_name: Optional[str] = Field(default="", max_length=200)
    idea: Optional[str] = Field(default="", max_length=5000)


class AIQuestionRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    logger.info("Root endpoint accessed")

    return {
        "success": True,
        "message": "Hackathon IQ API is running",
        "version": "2.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    logger.info("Health check requested")

    return {
        "success": True,
        "service": "Hackathon IQ Backend",
        "status": "healthy",
    }


# ============================================================
# DATABASE HEALTH
# ============================================================

@app.get("/api/database-health")
def database_health():
    logger.info("Database health check started")

    connection = None
    cursor = None

    try:
        connection = get_connection()

        logger.info("Snowflake connection established")

        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                CURRENT_DATABASE(),
                CURRENT_SCHEMA(),
                CURRENT_WAREHOUSE()
        """)

        result = cursor.fetchone()

        logger.info(
            "Snowflake health check successful | database=%s | schema=%s | warehouse=%s",
            result[0],
            result[1],
            result[2],
        )

        return {
            "success": True,
            "database": result[0],
            "schema": result[1],
            "warehouse": result[2],
            "status": "connected",
        }

    except Exception as error:
        logger.exception("Snowflake health check failed")

        raise HTTPException(
            status_code=500,
            detail=f"Snowflake connection failed: {str(error)}"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# AI HACKATHON QUESTION ANSWER
# ============================================================

@app.post("/api/ai/ask")
def ask_ai(data: AIQuestionRequest):
    logger.info("AI question request received")

    try:
        question = data.question.strip()

        if not question:
            logger.warning("AI request rejected: empty question")

            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty."
            )

        logger.info(
            "Processing AI question | length=%s",
            len(question),
        )

        result = ask_hackathon_ai(question)

        logger.info(
            "AI retrieval completed | retrieved_count=%s | grounded=%s",
            result.get("retrieved_count"),
            result.get("grounded"),
        )

        logger.info("AI response generated successfully")

        return {
            "success": True,
            "query": result["query"],
            "answer": result["answer"],
            "grounded": result["grounded"],
            "retrieved_count": result["retrieved_count"],
            "sources": result["sources"],
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception("AI request failed")

        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {str(error)}"
        )


# ============================================================
# PARTICIPANT REGISTRATION
# ============================================================

@app.post("/api/register")
def register_participant(data: RegistrationRequest):
    logger.info("Registration request received")

    connection = None
    cursor = None

    try:
        logger.info("Connecting to Snowflake for registration")

        connection = get_connection()

        logger.info("Snowflake connection established")

        cursor = connection.cursor()

        logger.info("Checking whether participant email already exists")

        cursor.execute(
            """
            SELECT PARTICIPANT_ID
            FROM PARTICIPANTS
            WHERE LOWER(EMAIL) = LOWER(%s)
            LIMIT 1
            """,
            (str(data.email),)
        )

        existing = cursor.fetchone()

        if existing:
            logger.warning("Registration rejected: duplicate email")

            raise HTTPException(
                status_code=409,
                detail="A participant with this email is already registered."
            )

        logger.info("Participant email is available")

        insert_query = """
            INSERT INTO PARTICIPANTS (
                FULL_NAME,
                EMAIL,
                PHONE,
                COLLEGE,
                CITY,
                SKILLS,
                TEAM_OPTION,
                TEAM_NAME,
                IDEA
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        logger.info("Attempting to insert participant into Snowflake")

        cursor.execute(
            insert_query,
            (
                data.full_name,
                str(data.email),
                data.phone,
                data.college,
                data.city,
                data.skills,
                data.team_option,
                data.team_name,
                data.idea,
            )
        )

        connection.commit()

        logger.info("Participant successfully stored in Snowflake")

        cursor.execute(
            """
            SELECT
                PARTICIPANT_ID,
                FULL_NAME,
                EMAIL,
                CREATED_AT
            FROM PARTICIPANTS
            WHERE LOWER(EMAIL) = LOWER(%s)
            ORDER BY CREATED_AT DESC
            LIMIT 1
            """,
            (str(data.email),)
        )

        participant = cursor.fetchone()

        if not participant:
            logger.error(
                "Registration was committed but participant could not be retrieved"
            )

            raise HTTPException(
                status_code=500,
                detail="Registration was saved but participant could not be retrieved."
            )

        logger.info(
            "Registration completed successfully | participant_id=%s",
            participant[0],
        )

        return {
            "success": True,
            "message": "Registration successful!",
            "participant": {
                "participant_id": participant[0],
                "full_name": participant[1],
                "email": participant[2],
                "created_at": str(participant[3]),
            },
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception("Registration failed")

        if connection:
            try:
                connection.rollback()
                logger.info("Snowflake transaction rolled back")
            except Exception:
                logger.exception("Failed to rollback Snowflake transaction")

        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(error)}"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

        logger.info("Registration database resources closed")


# ============================================================
# GET PARTICIPANTS
# ============================================================

@app.get("/api/participants")
def get_participants():
    logger.info("Participant list request received")

    connection = None
    cursor = None

    try:
        logger.info("Connecting to Snowflake to retrieve participants")

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                PARTICIPANT_ID,
                FULL_NAME,
                EMAIL,
                PHONE,
                COLLEGE,
                CITY,
                SKILLS,
                TEAM_OPTION,
                TEAM_NAME,
                IDEA,
                CREATED_AT
            FROM PARTICIPANTS
            ORDER BY CREATED_AT DESC
            """
        )

        rows = cursor.fetchall()

        logger.info(
            "Participants retrieved successfully | count=%s",
            len(rows),
        )

        participants = []

        for row in rows:
            participants.append({
                "participant_id": row[0],
                "full_name": row[1],
                "email": row[2],
                "phone": row[3],
                "college": row[4],
                "city": row[5],
                "skills": row[6],
                "team_option": row[7],
                "team_name": row[8],
                "idea": row[9],
                "created_at": str(row[10]),
            })

        return {
            "success": True,
            "count": len(participants),
            "participants": participants,
        }

    except Exception as error:
        logger.exception("Could not retrieve participants")

        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve participants: {str(error)}"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

        logger.info("Participant database resources closed")