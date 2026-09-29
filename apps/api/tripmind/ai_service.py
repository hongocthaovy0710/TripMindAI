"""
AI Service — sinh lịch trình du lịch.

Trong bài thực hành, phần gọi LLM thật được GIẢ LẬP (mock) bằng bộ sinh dữ liệu
xác định, để chạy được ngay mà không cần API key. Kiến trúc vẫn theo Adapter pattern
(5.6): chỉ cần thay lớp này bằng OpenAIClient/ClaudeClient thật là dùng LLM thật.
"""
from typing import Any

# Ngân hàng hoạt động mẫu theo loại sở thích (mock cho phần AI).
ACTIVITY_BANK: dict[str, list[dict[str, Any]]] = {
    "thiên nhiên": [
        {"name": "Tham quan hồ trung tâm", "time": "08:00", "cost": 0, "priority": "high"},
        {"name": "Đồi chè / vườn hoa", "time": "15:00", "cost": 50000, "priority": "medium"},
    ],
    "ẩm thực": [
        {"name": "Ăn sáng đặc sản địa phương", "time": "07:30", "cost": 60000, "priority": "medium"},
        {"name": "Ăn trưa nhà hàng nổi tiếng", "time": "12:00", "cost": 150000, "priority": "high"},
        {"name": "Chợ đêm ẩm thực", "time": "19:00", "cost": 200000, "priority": "medium"},
    ],
    "văn hóa": [
        {"name": "Bảo tàng / di tích lịch sử", "time": "09:30", "cost": 40000, "priority": "high"},
        {"name": "Làng nghề truyền thống", "time": "14:00", "cost": 30000, "priority": "low"},
    ],
    "mua sắm": [
        {"name": "Ghé shop lưu niệm", "time": "16:30", "cost": 100000, "priority": "low"},
    ],
    "check-in": [
        {"name": "Điểm check-in nổi tiếng", "time": "10:30", "cost": 20000, "priority": "medium"},
    ],
}

# Hoạt động mặc định khi không khớp sở thích nào.
DEFAULT_ACTIVITIES = [
    {"name": "Khám phá trung tâm thành phố", "time": "09:00", "cost": 0, "priority": "high"},
    {"name": "Thưởng thức cà phê view đẹp", "time": "15:30", "cost": 45000, "priority": "low"},
]


def generate_itinerary(destination: str, days: int, budget: float,
                       preferences: list[str]) -> dict[str, Any]:
    """
    Sinh lịch trình theo ngày dựa trên sở thích. Trả về cấu trúc khớp với
    API design 5.5: danh sách ngày, mỗi ngày là danh sách hoạt động có priority.
    """
    # Gom các hoạt động phù hợp với sở thích người dùng chọn.
    pool: list[dict[str, Any]] = []
    for pref in preferences:
        pool.extend(ACTIVITY_BANK.get(pref.strip().lower(), []))
    if not pool:
        pool = list(DEFAULT_ACTIVITIES)

    itinerary = []
    total = 0.0
    for day in range(1, days + 1):
        # Xoay vòng pool để mỗi ngày có tổ hợp hoạt động khác nhau.
        day_activities = []
        for i, act in enumerate(pool):
            if i % days == (day - 1) % max(len(pool), 1) or len(pool) <= days:
                day_activities.append(dict(act))
                total += act["cost"]
        if not day_activities:  # đảm bảo ngày nào cũng có ít nhất 1 hoạt động
            act = dict(pool[(day - 1) % len(pool)])
            day_activities.append(act)
            total += act["cost"]
        itinerary.append({"day": day, "activities": day_activities})

    return {
        "destination": destination,
        "days": days,
        "budget": budget,
        "estimated_cost": total,
        "within_budget": total <= budget,
        "itinerary": itinerary,
    }
