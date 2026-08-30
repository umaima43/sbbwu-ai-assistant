from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# ADMIN SETTINGS
# ============================================================

ADMIN_USERNAME = "admin"

# Temporary password for your FYP
ADMIN_PASSWORD = "admin123"

# Create password hash
ADMIN_PASSWORD_HASH = pwd_context.hash(
    ADMIN_PASSWORD
)


# ============================================================
# JWT SETTINGS
# ============================================================

SECRET_KEY = "sbbwui-fyp-admin-secret-key-change-this-later"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# ADMIN AUTHENTICATION
# ============================================================

def authenticate_admin(
    username: str,
    password: str,
) -> bool:

    if username != ADMIN_USERNAME:
        return False

    return verify_password(
        password,
        ADMIN_PASSWORD_HASH,
    )


# ============================================================
# TOKEN CREATION
# ============================================================

def create_access_token():

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": ADMIN_USERNAME,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================================
# TOKEN VERIFICATION
# ============================================================

def verify_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")

        if username != ADMIN_USERNAME:
            return None

        return username

    except JWTError:
        return None