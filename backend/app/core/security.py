"""
Security utilities
JWT tokens, password hashing, QR Code signing
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
import secrets
import pyotp

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    # Truncate password if too long for bcrypt (max 72 bytes)
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash (bcrypt max 72 bytes)"""
    # Truncate password if too long for bcrypt
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def sign_qr_code_data(data: Dict[str, Any], nonce: Optional[str] = None) -> str:
    """
    Generate cryptographic signature for QR Code
    Uses SHA-256 with secret key + nonce for anti-fraud
    """
    if nonce is None:
        nonce = secrets.token_urlsafe(16)
    
    # Create string to sign
    data_str = f"{data.get('visitor_id')}{data.get('unit_id')}{data.get('valid_until')}{nonce}"
    
    # Generate signature
    signature_input = f"{data_str}{settings.QR_SECRET_KEY}{nonce}"
    signature = hashlib.sha256(signature_input.encode()).hexdigest()
    
    return signature


def verify_qr_code_signature(data: Dict[str, Any], signature: str, nonce: str) -> bool:
    """
    Verify QR Code signature
    Returns True if signature is valid
    """
    expected_signature = sign_qr_code_data(data, nonce)
    return secrets.compare_digest(signature, expected_signature)


def generate_mfa_secret() -> str:
    """Generate MFA secret for TOTP"""
    return pyotp.random_base32()


def verify_mfa_token(secret: str, token: str) -> bool:
    """Verify MFA TOTP token"""
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)


def generate_nonce() -> str:
    """Generate unique nonce for QR Codes"""
    return secrets.token_urlsafe(16)
