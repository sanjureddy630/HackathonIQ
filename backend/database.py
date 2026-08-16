import os
from pathlib import Path

import snowflake.connector
from dotenv import load_dotenv


# Always load .env from the same folder as this file
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


def get_connection():
    account = os.getenv("SNOWFLAKE_ACCOUNT")
    user = os.getenv("SNOWFLAKE_USER")
    password = os.getenv("SNOWFLAKE_PASSWORD")
    warehouse = os.getenv("SNOWFLAKE_WAREHOUSE")

    if not account:
        raise RuntimeError("SNOWFLAKE_ACCOUNT is missing from backend/.env")

    if not user:
        raise RuntimeError("SNOWFLAKE_USER is missing from backend/.env")

    if not password:
        raise RuntimeError("SNOWFLAKE_PASSWORD is missing from backend/.env")

    if not warehouse:
        raise RuntimeError("SNOWFLAKE_WAREHOUSE is missing from backend/.env")

    return snowflake.connector.connect(
        account=account,
        user=user,
        password=password,
        warehouse=warehouse,
        database="HACKATHON_IQ",
        schema="HACKATHON",
    )


def test_connection():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                CURRENT_DATABASE(),
                CURRENT_SCHEMA(),
                CURRENT_WAREHOUSE()
        """)

        return cursor.fetchone()

    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    print("Checking Snowflake configuration...")

    result = test_connection()

    print()
    print("================================")
    print("SNOWFLAKE CONNECTION SUCCESSFUL")
    print("================================")
    print("Database :", result[0])
    print("Schema   :", result[1])
    print("Warehouse:", result[2])