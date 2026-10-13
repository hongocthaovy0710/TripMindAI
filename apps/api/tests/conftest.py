"""
Pytest configuration và shared fixtures cho bộ kiểm thử TripMind AI.
"""
import os
import tempfile
import pytest
from fastapi.testclient import TestClient

import tripmind.db as db_module
from tripmind.db import init_db
from tripmind.main import app


@pytest.fixture(autouse=True)
def isolated_db(monkeypatch):
    """
    Tạo một cơ sở dữ liệu SQLite tạm thời cho mỗi bài kiểm thử.
    Đảm bảo tính độc lập (Test Isolation), không làm ô nhiễm DB phát triển.
    """
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        temp_db_path = tmp.name

    monkeypatch.setattr(db_module, "DB_PATH", temp_db_path)
    init_db()

    yield temp_db_path

    # Dọn dẹp sau khi chạy test
    try:
        if os.path.exists(temp_db_path):
            os.remove(temp_db_path)
    except OSError:
        pass


@pytest.fixture
def client():
    """TestClient để gọi API FastAPI một cách đồng bộ và nhanh chóng."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def registered_user(client):
    """Fixture tạo sẵn 1 tài khoản người dùng chuẩn và trả về token xác thực."""
    user_payload = {
        "email": "traveler@tripmind.ai",
        "password": "Password123!",
        "name": "Nguyễn Du Khách",
    }
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == 201
    data = response.json()["data"]
    token = data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    return {
        "email": user_payload["email"],
        "password": user_payload["password"],
        "name": user_payload["name"],
        "token": token,
        "headers": headers,
    }


@pytest.fixture
def second_user(client):
    """Fixture tạo người dùng thứ hai để kiểm thử phân quyền và bảo mật sở hữu (ownership)."""
    user_payload = {
        "email": "hacker@tripmind.ai",
        "password": "HackerPass123!",
        "name": "User B",
    }
    response = client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == 201
    token = response.json()["data"]["token"]
    return {
        "email": user_payload["email"],
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
