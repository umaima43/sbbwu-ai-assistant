import sqlite3
from datetime import datetime, timedelta


DB_PATH = "chat_history.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(DISTINCT session_id)
        FROM messages
    """)
    total_sessions = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'user'
    """)
    total_questions = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
    """)
    total_messages = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND feedback = 1
    """)
    positive_feedback = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND feedback = 0
    """)
    negative_feedback = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT AVG(confidence)
        FROM messages
        WHERE role = 'assistant'
        AND confidence IS NOT NULL
    """)
    average_confidence = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND used_fallback = 1
    """)
    fallback_answers = cursor.fetchone()[0] or 0

    start_of_day = datetime.now().replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    ).timestamp()

    cursor.execute("""
        SELECT COUNT(DISTINCT session_id)
        FROM messages
        WHERE created_at >= ?
    """, (start_of_day,))

    active_today = cursor.fetchone()[0] or 0

    conn.close()

    return {
        "total_sessions": total_sessions,
        "total_questions": total_questions,
        "total_messages": total_messages,
        "active_today": active_today,
        "positive_feedback": positive_feedback,
        "negative_feedback": negative_feedback,
        "average_confidence": round(
            average_confidence,
            3
        ),
        "fallback_answers": fallback_answers,
    }


# ============================================================
# DAILY ACTIVITY
# ============================================================

def get_daily_activity(days=7):
    conn = get_connection()
    cursor = conn.cursor()

    days = max(1, min(days, 365))

    start_time = (
        datetime.now() -
        timedelta(days=days - 1)
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    ).timestamp()

    cursor.execute("""
        SELECT
            date(
                datetime(
                    created_at,
                    'unixepoch',
                    'localtime'
                )
            ) AS day,
            COUNT(*) AS messages
        FROM messages
        WHERE created_at >= ?
        GROUP BY day
        ORDER BY day
    """, (start_time,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "date": row[0],
            "messages": row[1],
        }
        for row in rows
    ]


# ============================================================
# UNANSWERED / FALLBACK QUESTIONS
# ============================================================

def get_unanswered_questions(limit=100):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.id,
            u.content,
            a.created_at
        FROM messages a

        JOIN messages u
            ON u.id = (
                SELECT MAX(u2.id)
                FROM messages u2
                WHERE u2.session_id = a.session_id
                AND u2.role = 'user'
                AND u2.id < a.id
            )

        WHERE a.role = 'assistant'
        AND a.used_fallback = 1

        ORDER BY a.created_at DESC

        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "question": row[1],
            "created_at": row[2],
        }
        for row in rows
    ]


# ============================================================
# USER ACTIVITY
# ============================================================

def get_user_activity():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            session_id,
            COUNT(*) AS messages,
            SUM(
                CASE
                    WHEN role = 'user' THEN 1
                    ELSE 0
                END
            ) AS questions,
            MAX(created_at) AS last_active
        FROM messages
        GROUP BY session_id
        ORDER BY last_active DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "session_id": row[0],
            "messages": row[1],
            "questions": row[2] or 0,
            "last_active": row[3],
        }
        for row in rows
    ]


# ============================================================
# FEEDBACK
# ============================================================

def get_feedback(limit=100):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.id,
            a.session_id,

            (
                SELECT u.content
                FROM messages u
                WHERE u.session_id = a.session_id
                AND u.role = 'user'
                AND u.id < a.id
                ORDER BY u.id DESC
                LIMIT 1
            ) AS question,

            a.content AS answer,
            a.feedback,
            a.created_at

        FROM messages a

        WHERE a.role = 'assistant'
        AND a.feedback IS NOT NULL

        ORDER BY a.created_at DESC

        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "id": row[0],
            "session_id": row[1],
            "question": row[2],
            "answer": row[3],
            "feedback": (
                "positive"
                if row[4] == 1
                else "negative"
            ),
            "created_at": row[5],
        }
        for row in rows
    ]


# ============================================================
# FEEDBACK STATISTICS
# ============================================================

def get_feedback_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND feedback IS NOT NULL
    """)
    total_feedback = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND feedback = 1
    """)
    positive_feedback = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT COUNT(*)
        FROM messages
        WHERE role = 'assistant'
        AND feedback = 0
    """)
    negative_feedback = cursor.fetchone()[0] or 0

    if total_feedback > 0:
        positive_percentage = round(
            (
                positive_feedback /
                total_feedback
            ) * 100,
            1
        )

        negative_percentage = round(
            (
                negative_feedback /
                total_feedback
            ) * 100,
            1
        )
    else:
        positive_percentage = 0
        negative_percentage = 0

    conn.close()

    return {
        "total_feedback": total_feedback,
        "positive_feedback": positive_feedback,
        "negative_feedback": negative_feedback,
        "positive_percentage": positive_percentage,
        "negative_percentage": negative_percentage,
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("\n========== DASHBOARD ==========")
    print(get_dashboard_stats())

    print("\n========== DAILY ACTIVITY ==========")
    print(get_daily_activity(7))

    print("\n========== UNANSWERED QUESTIONS ==========")
    print(get_unanswered_questions())

    print("\n========== USER ACTIVITY ==========")
    print(get_user_activity())

    print("\n========== FEEDBACK ==========")
    print(get_feedback())

    print("\n========== FEEDBACK STATISTICS ==========")
    print(get_feedback_stats())