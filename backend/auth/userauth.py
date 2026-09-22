import sqlite3
from pathlib import Path
from passlib.context import CryptContext


# ============================================================
# DATABASE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "databases" / "users.db"
# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# CREATE USERS TABLE
# ============================================================

def init_user_db():
    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            google_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# ============================================================
# CREATE NORMAL USER
# ============================================================

def create_user(
    name: str,
    email: str,
    password: str,
):
    password_hash = pwd_context.hash(password)

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users
            (name, email, password_hash)
            VALUES (?, ?, ?)
            """,
            (
                name,
                email.lower().strip(),
                password_hash,
            ),
        )

        conn.commit()

        return True

    except sqlite3.IntegrityError:
        return False

    finally:
        conn.close()


# ============================================================
# FIND USER BY EMAIL
# ============================================================

def get_user_by_email(email: str):

    conn = sqlite3.connect(DB_PATH)

    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email.lower().strip(),),
    )

    user = cursor.fetchone()

    conn.close()

    return user


# ============================================================
# FIND USER BY GOOGLE ID
# ============================================================

def get_user_by_google_id(google_id: str):

    conn = sqlite3.connect(DB_PATH)

    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE google_id = ?
        """,
        (google_id,),
    )

    user = cursor.fetchone()

    conn.close()

    return user


# ============================================================
# CREATE GOOGLE USER
# ============================================================

def create_google_user(
    name: str,
    email: str,
    google_id: str,
):

    conn = sqlite3.connect(DB_PATH)

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users
            (name, email, password_hash, google_id)
            VALUES (?, ?, ?, ?)
            """,
            (
                name.strip(),
                email.lower().strip(),
                None,
                google_id,
            ),
        )

        conn.commit()

        user_id = cursor.lastrowid

        return user_id

    except sqlite3.IntegrityError:
        return None

    finally:
        conn.close()


# ============================================================
# VERIFY NORMAL USER PASSWORD
# ============================================================

def verify_user_password(
    email: str,
    password: str,
):

    user = get_user_by_email(email)

    if not user:
        return None

    password_hash = user["password_hash"]

    if not password_hash:
        return None

    if not pwd_context.verify(
        password,
        password_hash,
    ):
        return None

    return user
