"""
8.2 Kiểm thử Tích hợp (Integration Testing)
Kiểm thử sự phối hợp giữa các thành phần trong hệ thống:
- Router (FastAPI) <-> Database (SQLite): lưu trữ, truy vấn, quan hệ cascade.
- Auth Middleware <-> Endpoints: kiểm tra JWT, chặn truy cập trái phép (401).
- Ownership Isolation: người dùng này không xem/sửa/xóa được dữ liệu người khác (404/403).
- Data Persistence: luồng từ generate -> save -> get detail -> update priority -> delete.
"""
import pytest
from tripmind.db import get_conn


@pytest.mark.integration
class TestAuthIntegration:
    """Kiểm thử tích hợp cho luồng Đăng ký & Đăng nhập người dùng."""

    def test_register_and_login_success(self, client):
        # 1. Đăng ký tài khoản
        reg_payload = {
            "email": "tester@tripmind.ai",
            "password": "Password123!",
            "name": "Kiểm thử viên",
        }
        res_reg = client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        body_reg = res_reg.json()
        assert body_reg["success"] is True
        assert "token" in body_reg["data"]
        assert body_reg["data"]["email"] == reg_payload["email"]

        # 2. Đăng nhập lại với tài khoản vừa tạo
        login_payload = {
            "email": reg_payload["email"],
            "password": reg_payload["password"],
        }
        res_login = client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        body_login = res_login.json()
        assert body_login["success"] is True
        assert "token" in body_login["data"]

    def test_register_duplicate_email_fails(self, client, registered_user):
        dup_payload = {
            "email": registered_user["email"],
            "password": "AnotherPassword123!",
            "name": "Người trùng lặp",
        }
        res = client.post("/api/v1/auth/register", json=dup_payload)
        assert res.status_code == 400
        assert "Email đã được sử dụng" in res.json()["detail"]

    def test_login_wrong_password_fails(self, client, registered_user):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": registered_user["email"], "password": "WrongPassword999"},
        )
        assert res.status_code == 401
        assert "Email hoặc mật khẩu không đúng" in res.json()["detail"]


@pytest.mark.integration
class TestTripsLifecycleIntegration:
    """Kiểm thử tích hợp toàn bộ vòng đời Chuyến đi (Generate -> Save -> View -> Patch -> Delete)."""

    def test_generate_requires_auth(self, client):
        res = client.post(
            "/api/v1/trips/generate",
            json={"destination": "Đà Lạt", "days": 3, "budget": 3000000},
        )
        assert res.status_code == 401

    def test_full_trip_persistence_and_cascading(self, client, registered_user, second_user):
        headers = registered_user["headers"]

        # 1. Sinh lịch trình từ AI Service
        gen_res = client.post(
            "/api/v1/trips/generate",
            headers=headers,
            json={
                "destination": "Nha Trang",
                "days": 2,
                "budget": 4500000,
                "preferences": ["ẩm thực", "thiên nhiên"],
            },
        )
        assert gen_res.status_code == 200
        ai_data = gen_res.json()["data"]
        assert len(ai_data["itinerary"]) == 2

        # 2. Lưu chuyến đi vào Database
        save_payload = {
            "destination": ai_data["destination"],
            "days": ai_data["days"],
            "budget": ai_data["budget"],
            "estimated_cost": ai_data["estimated_cost"],
            "preferences": ["ẩm thực", "thiên nhiên"],
            "itinerary": ai_data["itinerary"],
        }
        save_res = client.post("/api/v1/trips", headers=headers, json=save_payload)
        assert save_res.status_code == 201
        trip_id = save_res.json()["data"]["id"]
        assert trip_id is not None

        # 3. Lấy danh sách chuyến đi của user
        list_res = client.post = client.get("/api/v1/trips", headers=headers)
        assert list_res.status_code == 200
        trips_list = list_res.json()["data"]
        assert len(trips_list) >= 1
        assert any(t["id"] == trip_id for t in trips_list)

        # 4. Lấy chi tiết chuyến đi kèm các ngày và hoạt động
        detail_res = client.get(f"/api/v1/trips/{trip_id}", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()["data"]
        assert detail["id"] == trip_id
        assert len(detail["itinerary"]) == 2
        first_act = detail["itinerary"][0]["activities"][0]
        act_id = first_act["id"]
        initial_priority = first_act["priority"]

        # 5. Cập nhật Priority cho hoạt động (tính năng Activity Priority - Chương 4)
        new_priority = "high" if initial_priority != "high" else "low"
        patch_res = client.patch(
            f"/api/v1/activities/{act_id}",
            headers=headers,
            json={"priority": new_priority},
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["data"]["priority"] == new_priority

        # 6. Kiểm tra bảo mật Ownership (User B không thể sửa hoạt động của User A)
        hacker_headers = second_user["headers"]
        hack_patch = client.patch(
            f"/api/v1/activities/{act_id}",
            headers=hacker_headers,
            json={"priority": "low"},
        )
        assert hack_patch.status_code == 404

        # User B không xem được chuyến đi của User A
        hack_get = client.get(f"/api/v1/trips/{trip_id}", headers=hacker_headers)
        assert hack_get.status_code == 404

        # 7. Xóa chuyến đi và kiểm tra tính toàn vẹn Cascade trong Database
        del_res = client.delete(f"/api/v1/trips/{trip_id}", headers=headers)
        assert del_res.status_code == 200

        # Kiểm tra chi tiết chuyến đi không còn tồn tại
        get_after_del = client.get(f"/api/v1/trips/{trip_id}", headers=headers)
        assert get_after_del.status_code == 404

        # Trực tiếp kiểm tra DB xem các bảng con có sạch bóng không
        with get_conn() as conn:
            trip_count = conn.execute("SELECT COUNT(*) FROM trips WHERE id=?", (trip_id,)).fetchone()[0]
            dp_count = conn.execute("SELECT COUNT(*) FROM day_plans WHERE trip_id=?", (trip_id,)).fetchone()[0]
            act_count = conn.execute("SELECT COUNT(*) FROM activities WHERE id=?", (act_id,)).fetchone()[0]
            assert trip_count == 0
            assert dp_count == 0
            assert act_count == 0
