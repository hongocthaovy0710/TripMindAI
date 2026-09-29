"""
TripMind AI — FastAPI application (Application Layer, xem 5.1).
Định nghĩa các REST endpoint theo API design 5.5:
auth, trips (generate/save/list/detail/delete), activities (priority).
"""
import json

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db, get_conn, new_id
from .auth import hash_password, verify_password, create_token, current_user_id
from .ai_service import generate_itinerary
from .models import RegisterIn, LoginIn, GenerateIn, TripSaveIn, PriorityUpdateIn

app = FastAPI(title="TripMind AI API", version="1.0.0")

# Cho phép frontend (Vite dev server) gọi API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/api/v1/health")
def health():
    return {"success": True, "data": {"status": "ok"}}


# ---------------------------------------------------------------- Auth
@app.post("/api/v1/auth/register", status_code=201)
def register(body: RegisterIn):
    with get_conn() as conn:
        exists = conn.execute("SELECT 1 FROM users WHERE email=?", (body.email,)).fetchone()
        if exists:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email đã được sử dụng")
        uid = new_id()
        conn.execute(
            "INSERT INTO users (id, email, password_hash, name) VALUES (?,?,?,?)",
            (uid, body.email, hash_password(body.password), body.name),
        )
    return {"success": True, "data": {"token": create_token(uid), "email": body.email}}


@app.post("/api/v1/auth/login")
def login(body: LoginIn):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email=?", (body.email,)).fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email hoặc mật khẩu không đúng")
    return {"success": True, "data": {"token": create_token(row["id"]), "email": row["email"]}}


# ---------------------------------------------------------------- Trips
@app.post("/api/v1/trips/generate")
def generate(body: GenerateIn, _uid: str = Depends(current_user_id)):
    """Gọi AI Service sinh lịch trình (mock). Chưa lưu DB — chỉ trả kết quả."""
    data = generate_itinerary(body.destination, body.days, body.budget, body.preferences)
    return {"success": True, "data": data}


@app.post("/api/v1/trips", status_code=201)
def save_trip(body: TripSaveIn, uid: str = Depends(current_user_id)):
    """Lưu chuyến đi + lịch trình (ngày + hoạt động) vào DB."""
    with get_conn() as conn:
        trip_id = new_id()
        conn.execute(
            """INSERT INTO trips (id,user_id,destination,days,budget,estimated_cost,
               preferences,status) VALUES (?,?,?,?,?,?,?, 'saved')""",
            (trip_id, uid, body.destination, body.days, body.budget,
             body.estimated_cost, json.dumps(body.preferences, ensure_ascii=False)),
        )
        for day in body.itinerary:
            dp_id = new_id()
            conn.execute(
                "INSERT INTO day_plans (id,trip_id,day_number) VALUES (?,?,?)",
                (dp_id, trip_id, day["day"]),
            )
            for act in day.get("activities", []):
                conn.execute(
                    """INSERT INTO activities (id,day_plan_id,name,time,location,cost,priority)
                       VALUES (?,?,?,?,?,?,?)""",
                    (new_id(), dp_id, act["name"], act.get("time"), act.get("location"),
                     act.get("cost", 0), act.get("priority", "medium")),
                )
    return {"success": True, "data": {"id": trip_id}}


@app.get("/api/v1/trips")
def list_trips(uid: str = Depends(current_user_id)):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM trips WHERE user_id=? ORDER BY created_at DESC", (uid,)
        ).fetchall()
    return {"success": True, "data": [dict(r) for r in rows]}


@app.get("/api/v1/trips/{trip_id}")
def trip_detail(trip_id: str, uid: str = Depends(current_user_id)):
    with get_conn() as conn:
        trip = conn.execute(
            "SELECT * FROM trips WHERE id=? AND user_id=?", (trip_id, uid)
        ).fetchone()
        if not trip:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy chuyến đi")
        days = conn.execute(
            "SELECT * FROM day_plans WHERE trip_id=? ORDER BY day_number", (trip_id,)
        ).fetchall()
        itinerary = []
        for d in days:
            acts = conn.execute(
                "SELECT * FROM activities WHERE day_plan_id=?", (d["id"],)
            ).fetchall()
            itinerary.append({"day": d["day_number"], "activities": [dict(a) for a in acts]})
    result = dict(trip)
    result["itinerary"] = itinerary
    return {"success": True, "data": result}


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: str, uid: str = Depends(current_user_id)):
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM trips WHERE id=? AND user_id=?", (trip_id, uid))
        if cur.rowcount == 0:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy chuyến đi")
    return {"success": True, "data": {"deleted": trip_id}}


# ---------------------------------------------------------------- Activities / Priority
@app.patch("/api/v1/activities/{activity_id}")
def update_priority(activity_id: str, body: PriorityUpdateIn,
                    uid: str = Depends(current_user_id)):
    """Đổi độ ưu tiên một hoạt động (tính năng Activity Priority — Chương 4)."""
    with get_conn() as conn:
        # Kiểm tra hoạt động thuộc chuyến đi của user (ownership, xem 5.5).
        owned = conn.execute(
            """SELECT a.id FROM activities a
               JOIN day_plans d ON a.day_plan_id=d.id
               JOIN trips t ON d.trip_id=t.id
               WHERE a.id=? AND t.user_id=?""",
            (activity_id, uid),
        ).fetchone()
        if not owned:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy hoạt động")
        conn.execute(
            "UPDATE activities SET priority=? WHERE id=?", (body.priority, activity_id)
        )
    return {"success": True, "data": {"id": activity_id, "priority": body.priority}}
