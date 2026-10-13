"""
8.5 Thiết kế Bài kiểm thử (Test Design)
Ứng dụng các kỹ thuật thiết kế bài kiểm thử chuẩn mực quốc tế (ISTQB):
1. Phân vùng tương đương (Equivalence Partitioning - EP)
2. Phân tích giá trị biên (Boundary Value Analysis - BVA)
3. Bảng quyết định (Decision Table Testing)
4. Chuyển đổi trạng thái (State Transition Testing)
"""
import pytest
from pydantic import ValidationError
from tripmind.models import GenerateIn, RegisterIn, PriorityUpdateIn
from tripmind.ai_service import generate_itinerary


@pytest.mark.design_matrix
class TestBoundaryValueAnalysis:
    """
    Kỹ thuật Phân tích Giá trị Biên (BVA)
    Đặc tả yêu cầu:
    - days: 1 đến 30 ngày (CHECK days BETWEEN 1 AND 30)
    - budget: > 0 (CHECK budget > 0)
    - password: >= 8 ký tự, bcrypt cắt lát an toàn tại 72 bytes
    """

    @pytest.mark.parametrize("days,expected_valid", [
        (0, False),    # Min - 1: Dưới biên dưới -> Không hợp lệ
        (1, True),     # Min: Ngay tại biên dưới -> Hợp lệ
        (2, True),     # Min + 1: Trên biên dưới -> Hợp lệ
        (29, True),    # Max - 1: Dưới biên trên -> Hợp lệ
        (30, True),    # Max: Ngay tại biên trên -> Hợp lệ
        (31, False),   # Max + 1: Vượt quá biên trên -> Không hợp lệ
    ])
    def test_days_boundary_values(self, days, expected_valid):
        if expected_valid:
            m = GenerateIn(destination="Hà Nội", days=days, budget=1000000)
            assert m.days == days
        else:
            with pytest.raises(ValidationError):
                GenerateIn(destination="Hà Nội", days=days, budget=1000000)

    @pytest.mark.parametrize("budget,expected_valid", [
        (-100000.0, False),  # Âm: Không hợp lệ
        (0.0, False),        # Bằng 0: Không hợp lệ (gt=0)
        (0.01, True),        # Biên cực tiểu dương: Hợp lệ
        (1000000.0, True),   # Giá trị thông thường: Hợp lệ
        (100000000.0, True), # Ngân sách lớn: Hợp lệ
    ])
    def test_budget_boundary_values(self, budget, expected_valid):
        if expected_valid:
            m = GenerateIn(destination="Cần Thơ", days=2, budget=budget)
            assert m.budget == budget
        else:
            with pytest.raises(ValidationError):
                GenerateIn(destination="Cần Thơ", days=2, budget=budget)

    @pytest.mark.parametrize("pwd_len,expected_valid", [
        (7, False),  # 7 ký tự: Dưới ngưỡng tối thiểu 8 -> Không hợp lệ
        (8, True),   # 8 ký tự: Ngay tại biên dưới -> Hợp lệ
        (9, True),   # 9 ký tự: Trên biên -> Hợp lệ
    ])
    def test_password_length_boundary(self, pwd_len, expected_valid):
        pwd = "P" * pwd_len
        if expected_valid:
            m = RegisterIn(email="valid@tripmind.ai", password=pwd)
            assert len(m.password) == pwd_len
        else:
            with pytest.raises(ValidationError):
                RegisterIn(email="valid@tripmind.ai", password=pwd)


@pytest.mark.design_matrix
class TestEquivalencePartitioning:
    """
    Kỹ thuật Phân vùng Tương đương (Equivalence Partitioning - EP)
    Phân chia miền giá trị thành các vùng tương đương hợp lệ và không hợp lệ:
    - Priority enum: {'high', 'medium', 'low'} vs invalid strings
    - Destination: non-empty string vs empty string
    """

    @pytest.mark.parametrize("priority_val,is_valid", [
        ("high", True),       # Phân vùng hợp lệ 1
        ("medium", True),     # Phân vùng hợp lệ 2
        ("low", True),        # Phân vùng hợp lệ 3
        ("HIGH", False),      # Phân vùng không hợp lệ (sai case)
        ("urgent", False),    # Phân vùng không hợp lệ (không nằm trong tập định nghĩa)
        ("", False),          # Phân vùng không hợp lệ (chuỗi rỗng)
        ("normal", False),    # Phân vùng không hợp lệ
    ])
    def test_priority_equivalence_partitions(self, priority_val, is_valid):
        if is_valid:
            m = PriorityUpdateIn(priority=priority_val)
            assert m.priority == priority_val
        else:
            with pytest.raises(ValidationError):
                PriorityUpdateIn(priority=priority_val)

    @pytest.mark.parametrize("destination,is_valid", [
        ("Nha Trang", True),
        ("Tokyo, Japan", True),
        ("", False),          # Phân vùng không hợp lệ (chuỗi rỗng min_length=1)
    ])
    def test_destination_equivalence_partitions(self, destination, is_valid):
        if is_valid:
            m = GenerateIn(destination=destination, days=3, budget=2000000)
            assert m.destination == destination
        else:
            with pytest.raises(ValidationError):
                GenerateIn(destination=destination, days=3, budget=2000000)


@pytest.mark.design_matrix
class TestDecisionTableRules:
    """
    Kỹ thuật Bảng Quyết Định (Decision Table Testing)
    Kiểm tra logic kết hợp giữa sở thích người dùng và đánh giá ngân sách:
    - Quy tắc 1: Có sở thích & Ngân sách >= Chi phí ước tính -> within_budget = True
    - Quy tắc 2: Có sở thích & Ngân sách < Chi phí ước tính -> within_budget = False
    - Quy tắc 3: Không sở thích (fallback mặc định) & Ngân sách đầy đủ -> within_budget = True
    """

    def test_rule_1_preferences_and_sufficient_budget(self):
        res = generate_itinerary("Đà Lạt", days=2, budget=10000000, preferences=["ẩm thực"])
        assert len(res["itinerary"]) == 2
        assert res["within_budget"] is True
        assert res["estimated_cost"] <= res["budget"]

    def test_rule_2_preferences_and_insufficient_budget(self):
        res = generate_itinerary("Đà Lạt", days=2, budget=50000, preferences=["ẩm thực"])
        assert len(res["itinerary"]) == 2
        assert res["within_budget"] is False
        assert res["estimated_cost"] > res["budget"]

    def test_rule_3_empty_preferences_fallback_sufficient_budget(self):
        res = generate_itinerary("Đà Lạt", days=1, budget=1000000, preferences=[])
        assert len(res["itinerary"]) == 1
        assert res["within_budget"] is True
