"""
Lớp truy cập cơ sở dữ liệu (Data Layer) — áp dụng Repository pattern (xem 5.6).
Dùng SQLite cho gọn nhẹ; schema bám theo thiết kế 5.4 (users, trips, itineraries,
day_plans, activities) với cột `priority` cho tính năng Activity Priority (Chương 4).
"""
import sqlite3
import uuid
from contextlib import contextmanager
from .config import DB_PATH


@contextmanager
def get_conn():
    """Mở kết nối SQLite, tự đóng sau khi dùng (context manager)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # trả về dict-like row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def new_id() -> str:
    """Sinh UUID dạng chuỗi làm khóa chính (giống thiết kế 5.4)."""
    return str(uuid.uuid4())


def init_db() -> None:
    """Tạo bảng nếu chưa tồn tại. Gọi khi khởi động app."""
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            TEXT PRIMARY KEY,
                email         TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name          TEXT,
                created_at    TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS trips (
                id             TEXT PRIMARY KEY,
                user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                destination    TEXT NOT NULL,
                days           INTEGER NOT NULL CHECK (days BETWEEN 1 AND 30),
                budget         REAL NOT NULL CHECK (budget > 0),
                estimated_cost REAL DEFAULT 0,
                preferences    TEXT DEFAULT '[]',
                status         TEXT NOT NULL DEFAULT 'draft',
                created_at     TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS day_plans (
                id          TEXT PRIMARY KEY,
                trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                day_number  INTEGER NOT NULL CHECK (day_number >= 1)
            );

            CREATE TABLE IF NOT EXISTS activities (
                id          TEXT PRIMARY KEY,
                day_plan_id TEXT NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
                name        TEXT NOT NULL,
                time        TEXT,
                location    TEXT,
                cost        REAL DEFAULT 0,
                priority    TEXT NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('high','medium','low'))
            );

            CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
            CREATE INDEX IF NOT EXISTS idx_dayplans_trip ON day_plans(trip_id);
            CREATE INDEX IF NOT EXISTS idx_activities_dayplan
                ON activities(day_plan_id, priority);
            """
        )
