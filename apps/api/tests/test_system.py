"""
8.3 Kiểm thử Hệ thống (System Testing)
Kiểm thử toàn bộ hệ thống từ góc nhìn người dùng cuối (End-to-End) và các tiêu chuẩn phi chức năng:
- E2E User Journey: hành trình trọn vẹn của du khách từ đăng ký tài khoản, lên lịch trình,
  lưu chuyến đi, điều chỉnh ưu tiên điểm tham quan và quản lý kho chuyến đi.
- Security & Robustness: kiểm thử khả năng chống chịu trước token giả mạo, tấn công chèn chuỗi, payload dị dạng.
- Performance / Latency Baseline: đảm bảo thời gian phản hồi trung bình của API đáp ứng NFR (< 500ms).
"""
import time
import pytest
from jose import jwt


@pytest.mark.system
class TestSystemE2EJourney:
    """Kiểm thử hành trình người dùng hoàn chỉnh (End-to-End Journey)."""

    def test_complete_traveler_workflow(self, client):
        # Bước 1: Khách du lịch mới truy cập và tạo tài khoản
        email = f"voyager_{int(time.time())}@tripmind.ai"
        reg_res = client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "VoyagerPass2026!", "name": "Minh Vy"},
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["data"]["token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Bước 2: Kiểm tra trạng thái hệ thống qua Health Check
        health_res = client.get("/api/v1/health")
        assert health_res.status_code == 200
        assert health_res.json()["data"]["status"] == "ok"

        # Bước 3: Người dùng yêu cầu AI sinh lịch trình cho chuyến đi Đà Lạt 3 ngày
        gen_payload = {
            "destination": "Đà Lạt",
            "days": 3,
            "budget": 3500000,
            "preferences": ["thiên nhiên", "ẩm thực", "check-in"],
        }
        gen_res = client.post("/api/v1/trips/generate", headers=auth_headers, json=gen_payload)
        assert gen_res.status_code == 200
        ai_itinerary = gen_res.json()["data"]
        assert ai_itinerary["days"] == 3
        assert len(ai_itinerary["itinerary"]) == 3

        # Bước 4: Người dùng bấm "Lưu chuyến đi" vào hồ sơ cá nhân
        save_payload = {
            "destination": ai_itinerary["destination"],
            "days": ai_itinerary["days"],
            "budget": ai_itinerary["budget"],
            "estimated_cost": ai_itinerary["estimated_cost"],
            "preferences": gen_payload["preferences"],
            "itinerary": ai_itinerary["itinerary"],
        }
        save_res = client.post("/api/v1/trips", headers=auth_headers, json=save_payload)
        assert save_res.status_code == 201
        trip_id = save_res.json()["data"]["id"]

        # Bước 5: Xem danh sách chuyến đi của cá nhân
        list_res = client.get("/api/v1/trips", headers=auth_headers)
        assert list_res.status_code == 200
        assert any(t["id"] == trip_id for t in list_res.json()["data"])

        # Bước 6: Mở xem chi tiết chuyến đi vừa lưu
        detail_res = client.get(f"/api/v1/trips/{trip_id}", headers=auth_headers)
        assert detail_res.status_code == 200
        saved_trip = detail_res.json()["data"]

        # Bước 7: Điều chỉnh độ ưu tiên (Activity Priority System)
        # Nâng một hoạt động quan trọng lên "high" và một hoạt động phụ xuống "low"
        act_1 = saved_trip["itinerary"][0]["activities"][0]
        patch_res1 = client.patch(
            f"/api/v1/activities/{act_1['id']}",
            headers=auth_headers,
            json={"priority": "high"},
        )
        assert patch_res1.status_code == 200
        assert patch_res1.json()["data"]["priority"] == "high"

        # Bước 8: Dọn dẹp / Xóa chuyến đi
        del_res = client.delete(f"/api/v1/trips/{trip_id}", headers=auth_headers)
        assert del_res.status_code == 200

        # Kiểm chứng không còn trong danh sách
        final_list = client.get("/api/v1/trips", headers=auth_headers).json()["data"]
        assert not any(t["id"] == trip_id for t in final_list)


@pytest.mark.system
class TestSystemSecurityAndRobustness:
    """Kiểm thử độ an toàn, bảo mật và sức chịu đựng của hệ thống."""

    def test_tampered_jwt_token_rejected(self, client):
        # Token ký bằng khóa bí mật giả mạo
        fake_token = jwt.encode({"sub": "victim_id"}, "malicious-secret-key", algorithm="HS256")
        res = client.get("/api/v1/trips", headers={"Authorization": f"Bearer {fake_token}"})
        assert res.status_code == 401
        assert "Token không hợp lệ" in res.json()["detail"]

    def test_malformed_token_header_rejected(self, client):
        res = client.get("/api/v1/trips", headers={"Authorization": "NotBearerToken12345"})
        assert res.status_code == 401

    def test_sql_injection_in_destination_handled_safely(self, client, registered_user):
        """Đảm bảo chuỗi độc hại không làm hỏng cú pháp SQLite (nhờ parameterized query)."""
        sql_payload = {
            "destination": "Đà Lạt' OR '1'='1'; DROP TABLE trips; --",
            "days": 2,
            "budget": 2000000,
            "preferences": ["ẩm thực"],
        }
        res = client.post("/api/v1/trips/generate", headers=registered_user["headers"], json=sql_payload)
        assert res.status_code == 200
        assert "Đà Lạt" in res.json()["data"]["destination"]

    def test_nonexistent_trip_returns_404(self, client, registered_user):
        res = client.get("/api/v1/trips/non-existent-uuid-9999", headers=registered_user["headers"])
        assert res.status_code == 404
        assert "Không tìm thấy chuyến đi" in res.json()["detail"]


@pytest.mark.system
class TestSystemPerformanceBaseline:
    """Kiểm thử hiệu năng đáp ứng yêu cầu NFR (thời gian phản hồi < 500ms)."""

    def test_api_latency_under_500ms(self, client, registered_user):
        latencies = []
        headers = registered_user["headers"]

        for _ in range(5):
            t0 = time.perf_counter()
            res = client.post(
                "/api/v1/trips/generate",
                headers=headers,
                json={"destination": "Phú Quốc", "days": 3, "budget": 5000000},
            )
            elapsed_ms = (time.perf_counter() - t0) * 1000
            assert res.status_code == 200
            latencies.append(elapsed_ms)

        avg_latency = sum(latencies) / len(latencies)
        # Kỳ vọng phản hồi trung bình < 500ms (NFR)
        assert avg_latency < 500, f"Thời gian phản hồi quá chậm: {avg_latency:.2f}ms"
