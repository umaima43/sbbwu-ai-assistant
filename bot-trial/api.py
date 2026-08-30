
import os
from urllib.parse import quote

from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from authlib.integrations.starlette_client import OAuth

from chat_engine import ChatEngine

from admin_stats import (
    get_dashboard_stats,
    get_daily_activity,
    get_unanswered_questions,
    get_user_activity,
    get_feedback,
    get_feedback_stats,
)

from admin_auth import (
    ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH,
    verify_password,
    create_access_token,
    verify_access_token,
)

from userauth import (
    init_user_db,
    create_user,
    get_user_by_email,
    get_user_by_google_id,
    create_google_user,
    verify_user_password,
)


# ============================================================
# GOOGLE OAUTH CONFIGURATION
# ============================================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://127.0.0.1:8000/auth/google/callback",
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)

# IMPORTANT:
# This secret is used by SessionMiddleware to securely sign
# the OAuth session cookie.
SESSION_SECRET = os.getenv(
    "SESSION_SECRET",
    "sbbwu-chatbot-development-secret-change-this",
)


# ============================================================
# GOOGLE OAUTH CLIENT
# ============================================================

oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url=(
        "https://accounts.google.com/.well-known/openid-configuration"
    ),
    client_kwargs={
        "scope": "openid email profile",
    },
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="SBBWU AI Chatbot API",
    description="Backend API for SBBWU AI Chatbot and Admin Dashboard",
    version="1.0.0",
)


# ============================================================
# SESSION MIDDLEWARE
# ============================================================
#
# REQUIRED BY AUTHLIB GOOGLE OAUTH.
#
# Authlib stores OAuth state inside request.session.
# Without this middleware, /auth/google gives:
#
# AssertionError:
# SessionMiddleware must be installed to access request.session
#
# ============================================================

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="sbbwu_oauth_session",
    max_age=600,
    same_site="lax",
    https_only=False,  # True when deployed with HTTPS
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CHAT ENGINE
# ============================================================

engine = ChatEngine()


# ============================================================
# USER DATABASE
# ============================================================

init_user_db()


# ============================================================
# REQUEST MODELS
# ============================================================

class ChatRequest(BaseModel):
    session_id: str
    message: str


class FeedbackRequest(BaseModel):
    message_id: int
    positive: bool


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


# ============================================================
# ADMIN AUTHENTICATION
# ============================================================

def require_admin(
    authorization: str | None = Header(default=None)
):
    """
    Check that the request contains a valid admin JWT token.
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Admin authentication required",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header",
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1,
    ).strip()

    username = verify_access_token(token)

    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin token",
        )

    return username


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "SBBWU AI Chatbot API is running",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
    }


# ============================================================
# CHAT API
# ============================================================

@app.post("/chat")
def chat(req: ChatRequest):

    result = engine.handle_message(
        req.session_id,
        req.message,
    )

    return {
        "answer": result.answer,
        "message_id": result.message_id,
        "sources": result.sources,
        "confidence": result.confidence,
        "intent": result.intent,
    }


# ============================================================
# FEEDBACK API
# ============================================================

@app.post("/feedback")
def feedback(req: FeedbackRequest):

    engine.record_feedback(
        req.message_id,
        req.positive,
    )

    return {
        "status": "ok",
    }


# ============================================================
# USER SIGNUP
# ============================================================

@app.post("/auth/signup")
def user_signup(req: UserSignupRequest):

    name = req.name.strip()
    email = req.email.lower().strip()
    password = req.password

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required",
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    existing_user = get_user_by_email(email)

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    created = create_user(
        name=name,
        email=email,
        password=password,
    )

    if not created:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    return {
        "status": "success",
        "message": "Account created successfully",
    }


# ============================================================
# USER LOGIN
# ============================================================

@app.post("/auth/login")
def user_login(req: UserLoginRequest):

    email = req.email.lower().strip()

    user = verify_user_password(
        email=email,
        password=req.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


# ============================================================
# GOOGLE LOGIN
# ============================================================

@app.get("/auth/google")
async def google_login(request: Request):

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID is not configured",
        )

    if not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_SECRET is not configured",
        )

    if not GOOGLE_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_REDIRECT_URI is not configured",
        )

    print("Starting Google OAuth...")
    print("Google Client ID:", GOOGLE_CLIENT_ID[:10] + "...")
    print("Google Redirect URI:", GOOGLE_REDIRECT_URI)

    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI,
    )


# ============================================================
# GOOGLE CALLBACK
# ============================================================

@app.get("/auth/google/callback")
async def google_callback(request: Request):

    try:

        # ----------------------------------------------------
        # EXCHANGE GOOGLE CODE FOR TOKEN
        # ----------------------------------------------------

        token = await oauth.google.authorize_access_token(
            request
        )

        # ----------------------------------------------------
        # GET GOOGLE USER INFORMATION
        # ----------------------------------------------------

        user_info = token.get("userinfo")

        if not user_info:

            user_info = await oauth.google.userinfo(
                token=token
            )

        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name")

        # ----------------------------------------------------
        # VALIDATE GOOGLE INFORMATION
        # ----------------------------------------------------

        if not google_id:
            raise HTTPException(
                status_code=400,
                detail="Google did not return a user ID",
            )

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Google did not return an email address",
            )

        email = email.lower().strip()

        name = (
            name
            or email.split("@")[0]
        ).strip()

        # ----------------------------------------------------
        # FIND EXISTING GOOGLE USER
        # ----------------------------------------------------

        user = get_user_by_google_id(
            google_id
        )

        # ----------------------------------------------------
        # CREATE GOOGLE USER IF NOT FOUND
        # ----------------------------------------------------

        if not user:

            # Check whether the email belongs
            # to an existing normal account.
            existing_user = get_user_by_email(
                email
            )

            if existing_user:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "An account with this email already exists. "
                        "Please sign in using your email and password."
                    ),
                )

            # Create Google account.
            user_id = create_google_user(
                name=name,
                email=email,
                google_id=google_id,
            )

            if not user_id:

                raise HTTPException(
                    status_code=500,
                    detail="Could not create Google account",
                )

            # Load newly-created user.
            user = get_user_by_google_id(
                google_id
            )

        # ----------------------------------------------------
        # VERIFY USER EXISTS
        # ----------------------------------------------------

        if not user:

            raise HTTPException(
                status_code=500,
                detail="Could not load Google user",
            )

        # ----------------------------------------------------
        # REDIRECT USER TO FRONTEND
        # ----------------------------------------------------

        user_id = quote(
            str(user["id"])
        )

        user_name = quote(
            user["name"] or ""
        )

        user_email = quote(
            user["email"] or ""
        )

        redirect_url = (
            f"{FRONTEND_URL}/auth"
            f"?google_success=true"
            f"&id={user_id}"
            f"&name={user_name}"
            f"&email={user_email}"
        )

        print(
            "Google login successful:",
            user["email"],
        )

        return RedirectResponse(
            url=redirect_url,
            status_code=302,
        )

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Google OAuth error:",
            repr(e),
        )

        raise HTTPException(
            status_code=500,
            detail="Google authentication failed",
        )


# ============================================================
# ADMIN LOGIN
# ============================================================

@app.post("/admin/login")
def admin_login(req: AdminLoginRequest):

    if req.username != ADMIN_USERNAME:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not verify_password(
        req.password,
        ADMIN_PASSWORD_HASH,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_access_token()

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    admin: str = Depends(require_admin),
):

    return get_dashboard_stats()


# ============================================================
# ADMIN ACTIVITY ANALYTICS
# ============================================================

@app.get("/admin/analytics/daily")
def daily_analytics(
    days: int = 180,
    admin: str = Depends(require_admin),
):

    days = max(
        1,
        min(days, 365),
    )

    return get_daily_activity(days)


# ============================================================
# ADMIN UNANSWERED QUESTIONS
# ============================================================

@app.get("/admin/unanswered")
def unanswered_questions(
    admin: str = Depends(require_admin),
):

    return get_unanswered_questions(100)


# ============================================================
# ADMIN USER ACTIVITY
# ============================================================

@app.get("/admin/analytics/users")
def user_activity(
    admin: str = Depends(require_admin),
):

    return get_user_activity()


# ============================================================
# ADMIN FEEDBACK
# ============================================================

@app.get("/admin/feedback")
def admin_feedback(
    admin: str = Depends(require_admin),
):

    return get_feedback(100)


# ============================================================
# ADMIN FEEDBACK STATISTICS
# ============================================================

@app.get("/admin/feedback/stats")
def admin_feedback_stats(
    admin: str = Depends(require_admin),
):

    return get_feedback_stats()


# ============================================================
# OPTIONAL UNANSWERED QUESTIONS ALIAS
# ============================================================

@app.get("/admin/analytics/unanswered")
def unanswered_questions_alias(
    admin: str = Depends(require_admin),
):

    return get_unanswered_questions(100)

