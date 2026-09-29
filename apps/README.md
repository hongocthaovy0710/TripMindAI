# TripMind AI — Ứng dụng full-stack (Chương 6)

Sản phẩm demo được **lập trình cùng AI** cho Chương 6. Gồm backend FastAPI (Python) và
frontend React (Vite + TypeScript), hiện thực hóa thiết kế từ Chương 5 và tính năng
Activity Priority từ Chương 4.

## Cấu trúc

```
apps/
├── api/   # Backend FastAPI + SQLite (auth JWT, trips, AI mock, priority)
└── web/   # Frontend React + Vite (đăng nhập, tạo lịch trình, lọc/đổi priority)
```

## Cách chạy

### 1. Backend (cổng 8000)

```bash
cd apps/api
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
./.venv/Scripts/python.exe -m uvicorn tripmind.main:app --port 8000
```

Mở tài liệu API tự động tại `http://127.0.0.1:8000/docs`.

### 2. Frontend (cổng 5173)

```bash
cd apps/web
npm install
npm run dev
```

Mở `http://localhost:5173`, đăng ký tài khoản → tạo lịch trình → đổi/lọc độ ưu tiên.

## Công nghệ

| Tầng | Công nghệ |
|------|-----------|
| Backend | FastAPI, SQLite, python-jose (JWT), bcrypt |
| Frontend | React 18, Vite, TypeScript |
| AI | Mock service (Adapter pattern — thay được bằng LLM thật) |

## Ánh xạ với thiết kế

- **Kiến trúc phân tầng** (5.1): presentation (web) → application (main.py) → business (ai_service) → data (db.py).
- **Database** (5.4): bảng users/trips/day_plans/activities, cột `priority`.
- **API** (5.5): endpoint `/api/v1/...`, JWT, cấu trúc response `{success, data}`.
- **Design patterns** (5.6): Repository (db), Adapter (ai_service), Singleton (kết nối).
- **Activity Priority** (Chương 4): gán/hiển thị/đổi/lọc priority hoạt động.
