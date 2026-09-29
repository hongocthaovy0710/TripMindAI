import { useState } from "react";
import { api, setToken, clearToken, type Itinerary, type Activity } from "./api";

const PRIORITY_META: Record<string, { label: string; icon: string; cls: string }> = {
  high: { label: "High", icon: "▲", cls: "p-high" },
  medium: { label: "Medium", icon: "■", cls: "p-medium" },
  low: { label: "Low", icon: "▽", cls: "p-low" },
};
const PREF_OPTIONS = ["thiên nhiên", "ẩm thực", "văn hóa", "check-in", "mua sắm"];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState("");

  function logout() {
    clearToken();
    setLoggedIn(false);
    setItinerary(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>TripMind AI 🧠✈️</h1>
        {loggedIn && (
          <button className="quiet" onClick={logout}>
            Đăng xuất
          </button>
        )}
      </header>

      {error && <div className="banner error">{error}</div>}

      {!loggedIn ? (
        <AuthForm onDone={() => setLoggedIn(true)} onError={setError} />
      ) : (
        <>
          <TripForm onResult={setItinerary} onError={setError} />
          {itinerary && <ItineraryView data={itinerary} onError={setError} />}
        </>
      )}
      <footer className="foot">
        Chương 6 · Demo full-stack TripMind AI (FastAPI + React)
      </footer>
    </div>
  );
}

/* ---------------------------------------------------- Auth */
function AuthForm({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError("");
    setBusy(true);
    try {
      const res =
        mode === "register"
          ? await api.register(email, password, name)
          : await api.login(email, password);
      setToken(res.token);
      onDone();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="tabs">
        <button type="button" className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>
          Đăng ký
        </button>
        <button type="button" className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>
          Đăng nhập
        </button>
      </div>
      <label>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label>Mật khẩu (≥ 8 ký tự)</label>
      <input type="password" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />
      {mode === "register" && (
        <>
          <label>Tên</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "Đang xử lý..." : mode === "register" ? "Đăng ký" : "Đăng nhập"}
      </button>
    </form>
  );
}

/* ---------------------------------------------------- Trip form */
function TripForm({ onResult, onError }: { onResult: (i: Itinerary) => void; onError: (m: string) => void }) {
  const [destination, setDestination] = useState("Đà Lạt");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(3000000);
  const [prefs, setPrefs] = useState<string[]>(["ẩm thực", "thiên nhiên"]);
  const [busy, setBusy] = useState(false);

  function togglePref(p: string) {
    setPrefs((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError("");
    setBusy(true);
    try {
      onResult(await api.generate(destination, days, budget, prefs));
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Tạo chuyến đi mới</h2>
      <label>Điểm đến</label>
      <input value={destination} onChange={(e) => setDestination(e.target.value)} required />
      <div className="row">
        <div>
          <label>Số ngày</label>
          <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(+e.target.value)} />
        </div>
        <div>
          <label>Ngân sách (VND)</label>
          <input type="number" min={1} value={budget} onChange={(e) => setBudget(+e.target.value)} />
        </div>
      </div>
      <label>Sở thích</label>
      <div className="chips">
        {PREF_OPTIONS.map((p) => (
          <button type="button" key={p} className={prefs.includes(p) ? "chip on" : "chip"} onClick={() => togglePref(p)}>
            {p}
          </button>
        ))}
      </div>
      <button className="primary" disabled={busy}>
        {busy ? "AI đang tạo lịch trình..." : "Tạo lịch trình"}
      </button>
    </form>
  );
}

/* ---------------------------------------------------- Itinerary view + Priority filter */
function ItineraryView({ data, onError }: { data: Itinerary; onError: (m: string) => void }) {
  const [itin, setItin] = useState(data);
  const [filter, setFilter] = useState<string>("all");
  const [saved, setSaved] = useState(false);

  // Lọc hoạt động theo priority (tính năng Activity Priority — Chương 4).
  const filtered = itin.itinerary.map((day) => ({
    ...day,
    activities: filter === "all" ? day.activities : day.activities.filter((a) => a.priority === filter),
  }));
  const isEmpty = filtered.every((d) => d.activities.length === 0);

  async function changePriority(act: Activity, priority: string) {
    // Cập nhật lạc quan trên UI; nếu đã lưu (có id) thì gọi API.
    setItin((cur) => ({
      ...cur,
      itinerary: cur.itinerary.map((day) => ({
        ...day,
        activities: day.activities.map((a) => (a === act ? { ...a, priority: priority as Activity["priority"] } : a)),
      })),
    }));
    if (act.id) {
      try {
        await api.updatePriority(act.id, priority);
      } catch (err) {
        onError((err as Error).message);
      }
    }
  }

  async function save() {
    onError("");
    try {
      await api.saveTrip(itin);
      setSaved(true);
    } catch (err) {
      onError((err as Error).message);
    }
  }

  return (
    <div className="card">
      <div className="itin-head">
        <h2>
          {itin.destination} · {itin.days} ngày
        </h2>
        <span className={itin.within_budget ? "cost ok" : "cost over"}>
          💰 {itin.estimated_cost.toLocaleString("vi-VN")}đ / {itin.budget.toLocaleString("vi-VN")}đ{" "}
          {itin.within_budget ? "✅" : "⚠️ vượt ngân sách"}
        </span>
      </div>

      <div className="filterbar">
        <span>Lọc ưu tiên:</span>
        {["all", "high", "medium", "low"].map((f) => (
          <button key={f} className={filter === f ? "chip on" : "chip"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : `${PRIORITY_META[f].icon} ${PRIORITY_META[f].label}`}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="empty">
          <p>Không có hoạt động ưu tiên {filter !== "all" ? PRIORITY_META[filter].label : ""}.</p>
          <button className="secondary" onClick={() => setFilter("all")}>
            Xem tất cả (All)
          </button>
        </div>
      ) : (
        filtered.map((day) => (
          <div key={day.day} className="day">
            <h3>NGÀY {day.day}</h3>
            {day.activities.map((act, i) => (
              <div key={i} className="activity">
                <div className="act-main">
                  <strong>{act.name}</strong>
                  <span className="act-meta">
                    {act.time} · {act.cost.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <select
                  className={`badge ${PRIORITY_META[act.priority].cls}`}
                  value={act.priority}
                  onChange={(e) => changePriority(act, e.target.value)}
                >
                  <option value="high">▲ High</option>
                  <option value="medium">■ Medium</option>
                  <option value="low">▽ Low</option>
                </select>
              </div>
            ))}
          </div>
        ))
      )}

      <button className="primary" onClick={save} disabled={saved}>
        {saved ? "✅ Đã lưu chuyến đi" : "Lưu chuyến đi"}
      </button>
    </div>
  );
}
