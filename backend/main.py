from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from database import get_connection
from rag_engine import ask_hackathon_ai

app = FastAPI(
    title="Hackathon IQ API",
    description="AI-powered hackathon registration and intelligence platform",
    version="2.0.0",
)

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


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Hackathon IQ API is running",
        "version": "2.0.0",
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "service": "Hackathon IQ Backend",
        "status": "healthy",
    }


@app.get("/api/database-health")
def database_health():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT
                CURRENT_DATABASE(),
                CURRENT_SCHEMA(),
                CURRENT_WAREHOUSE()
        """)
        result = cursor.fetchone()
        return {
            "success": True,
            "database": result[0],
            "schema": result[1],
            "warehouse": result[2],
            "status": "connected",
        }
    except Exception as error:
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
    try:
        question = data.question.strip()

        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty."
            )

        result = ask_hackathon_ai(question)

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
        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {str(error)}"
        )


@app.post("/api/register")
def register_participant(data: RegistrationRequest):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

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
            raise HTTPException(
                status_code=409,
                detail="A participant with this email is already registered."
            )

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
            raise HTTPException(
                status_code=500,
                detail="Registration was saved but participant could not be retrieved."
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
        if connection:
            try:
                connection.rollback()
            except Exception:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(error)}"
        )
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.get("/api/participants")
def get_participants():
    connection = None
    cursor = None

    try:
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
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve participants: {str(error)}"
        )
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
