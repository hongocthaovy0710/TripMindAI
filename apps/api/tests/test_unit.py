"""
8.1 Kiểm thử Đơn vị (Unit Testing)
Kiểm thử các hàm và module độc lập không phụ thuộc DB hay Network:
- auth.py: băm mật khẩu bcrypt, kiểm tra mật khẩu, sinh JWT token.
- ai_service.py: thuật toán sinh lịch trình, phân bổ hoạt động, tính toán chi phí và cờ ngân sách.
- models.py: validation schema Pydantic cho đầu vào dữ liệu.
"""
import pytest
from pydantic import ValidationError
from jose import jwt

from tripmind.auth import hash_password, verify_password, create_token
from tripmind.ai_service import generate_itinerary, ACTIVITY_BANK, DEFAULT_ACTIVITIES
from tripmind.models import RegisterIn, LoginIn, GenerateIn, TripSaveIn, PriorityUpdateIn
from tripmind.config import SECRET_KEY, ALGORITHM


@pytest.mark.unit
class TestAuthUnit:
    """Kiểm thử đơn vị cho module xác thực (tripmind.auth)."""

    def test_hash_password_returns_bcrypt_hash(self):
        raw = "SecurePassword123!"
        hashed = hash_password(raw)
        assert hashed != raw
        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")

    def test_verify_password_success(self):
        raw = "TripMind2026!"
        hashed = hash_password(raw)
        assert verify_password(raw, hashed) is True

    def test_verify_password_mismatch(self):
        raw = "CorrectPassword"
        hashed = hash_password(raw)
        assert verify_password("WrongPassword", hashed) is False

    def test_password_truncation_safety_over_72_bytes(self):
        """Bcrypt chỉ nhận tối đa 72 bytes. Hàm hash_password phải cắt an toàn không gây crash."""
        long_pwd = "A" * 150
        hashed = hash_password(long_pwd)
        assert verify_password(long_pwd, hashed) is True
        # Ký tự ngoài 72 bytes đầu vẫn tương thích do cắt lát [:72]
        assert verify_password("A" * 72 + "B" * 50, hashed) is True

    def test_create_token_contains_valid_claims(self):
        uid = "usr-uuid-12345"
        token = create_token(uid)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == uid
        assert "exp" in payload
        assert payload["exp"] > 0


@pytest.mark.unit
class TestAIServiceUnit:
    """Kiểm thử đơn vị cho bộ sinh lịch trình thông minh (tripmind.ai_service)."""

    def test_generate_itinerary_structure(self):
        res = generate_itinerary(
            destination="Đà Lạt",
            days=3,
            budget=5000000.0,
            preferences=["thiên nhiên", "ẩm thực"],
        )
        assert res["destination"] == "Đà Lạt"
        assert res["days"] == 3
        assert res["budget"] == 5000000.0
        assert isinstance(res["estimated_cost"], (int, float))
        assert isinstance(res["within_budget"], bool)
        assert len(res["itinerary"]) == 3

    def test_generate_itinerary_day_numbering(self):
        res = generate_itinerary("Hà Giang", 4, 3000000, ["thiên nhiên"])
        for idx, day in enumerate(res["itinerary"], start=1):
            assert day["day"] == idx
            assert len(day["activities"]) > 0

    def test_generate_itinerary_fallback_when_preferences_empty(self):
        """Khi người dùng không chọn sở thích nào, hệ thống dùng DEFAULT_ACTIVITIES."""
        res = generate_itinerary("Đà Nẵng", 2, 2000000, [])
        assert len(res["itinerary"]) == 2
        for day in res["itinerary"]:
            act_names = [a["name"] for a in day["activities"]]
            assert any(a["name"] in [d["name"] for d in DEFAULT_ACTIVITIES] for a in day["activities"])

    def test_generate_itinerary_priority_present(self):
        """Mọi hoạt động trong lịch trình phải có thuộc tính priority (Chương 4)."""
        res = generate_itinerary("Nha Trang", 2, 4000000, ["ẩm thực", "check-in"])
        valid_priorities = {"high", "medium", "low"}
        for day in res["itinerary"]:
            for act in day["activities"]:
                assert act.get("priority") in valid_priorities

    def test_within_budget_flag_calculation(self):
        # Trường hợp ngân sách dư dả
        rich_trip = generate_itinerary("Phú Quốc", 1, 10000000, ["mua sắm"])
        assert rich_trip["within_budget"] is True
        assert rich_trip["estimated_cost"] <= rich_trip["budget"]

        # Trường hợp ngân sách rất thấp (thấp hơn chi phí hoạt động)
        tight_trip = generate_itinerary("Phú Quốc", 3, 100, ["ẩm thực", "mua sắm"])
        assert tight_trip["within_budget"] is False
        assert tight_trip["estimated_cost"] > tight_trip["budget"]


@pytest.mark.unit
class TestModelsValidationUnit:
    """Kiểm thử đơn vị cho validation Pydantic schemas (tripmind.models)."""

    def test_register_in_valid(self):
        model = RegisterIn(email="user@tripmind.ai", password="12345678", name="Vy")
        assert model.email == "user@tripmind.ai"
        assert model.name == "Vy"

    def test_register_in_invalid_email(self):
        with pytest.raises(ValidationError):
            RegisterIn(email="not-an-email", password="12345678")

    def test_register_in_short_password(self):
        with pytest.raises(ValidationError):
            RegisterIn(email="user@tripmind.ai", password="short")

    def test_generate_in_valid(self):
        model = GenerateIn(destination="Sa Pa", days=3, budget=2500000)
        assert model.destination == "Sa Pa"
        assert model.days == 3

    def test_generate_in_boundary_days(self):
        # 0 ngày: không hợp lệ (ge=1)
        with pytest.raises(ValidationError):
            GenerateIn(destination="Huế", days=0, budget=1000000)

        # 31 ngày: không hợp lệ (le=30)
        with pytest.raises(ValidationError):
            GenerateIn(destination="Huế", days=31, budget=1000000)

    def test_generate_in_negative_budget(self):
        with pytest.raises(ValidationError):
            GenerateIn(destination="Huế", days=3, budget=-500)

    def test_priority_update_in_valid_values(self):
        for p in ["high", "medium", "low"]:
            m = PriorityUpdateIn(priority=p)
            assert m.priority == p

    def test_priority_update_in_invalid_value(self):
        with pytest.raises(ValidationError):
            PriorityUpdateIn(priority="critical")
