"""
Xác thực (Auth) — hash mật khẩu bằng bcrypt, cấp/kiểm JWT.
Bám theo thiết kế bảo mật 5.5: JWT trong header Authorization, bcrypt cho mật khẩu.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    # bcrypt chỉ nhận tối đa 72 byte; cắt an toàn trước khi băm.
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    pw = plain.encode("utf-8")[:72]
    return bcrypt.checkpw(pw, hashed.encode("utf-8"))


def create_token(user_id: str) -> str:
    """Tạo JWT chứa user_id (sub) và thời hạn."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def current_user_id(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    """Dependency: lấy user_id từ JWT hợp lệ, nếu không thì 401."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Thiếu token đăng nhập")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise JWTError("Thiếu sub")
        return user_id
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token không hợp lệ")
