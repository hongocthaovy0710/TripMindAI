import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { destinations } from '../data/destinations';
import { places } from '../data/places';
import { useApp } from '../context/AppContext';
import type { Trip, DayPlan, Activity } from '../types';

const POPULAR_DESTS = [
  { id: 'dalat', name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=70' },
  { id: 'danang', name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=70' },
  { id: 'hagiang', name: 'Hà Giang', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=70' },
  { id: 'phuquoc', name: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&q=70' },
  { id: 'hoian', name: 'Hội An', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70' },
  { id: 'ninhbinh', name: 'Ninh Bình', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=70' },
];

const PREFERENCE_OPTIONS = [
  { key: 'chill', label: 'Nghỉ dưỡng & Chill', icon: '🏖️' },
  { key: 'food', label: 'Ẩm thực & Cà phê', icon: '🍜' },
  { key: 'nature', label: 'Thiên nhiên hùng vĩ', icon: '🌲' },
  { key: 'culture', label: 'Văn hóa & Lịch sử', icon: '🏛️' },
  { key: 'photography', label: 'Check-in sống ảo', icon: '📸' },
  { key: 'adventure', label: 'Mạo hiểm & Trekking', icon: '🧗' },
];

const BUDGET_PRESETS = [
  { label: 'Tiết kiệm (2.5M)', value: 2500000 },
  { label: 'Cân bằng (5M)', value: 5000000 },
  { label: 'Thoải mái (8M)', value: 8000000 },
  { label: 'Cao cấp (15M)', value: 15000000 },
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { addTrip, addNotification } = useApp();

  const [destination, setDestination] = useState('Đà Nẵng');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5000000);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(['chill', 'food']);
  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedTrip, setGeneratedTrip] = useState<Trip | null>(null);

  function togglePref(p: string) {
    setSelectedPrefs((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  }

  // Fallback itinerary generator using local data
  function generateFallbackItinerary(destName: string, numDays: number, totalBudget: number): Trip {
    const destObj = destinations.find(
      (d) => d.name.toLowerCase().includes(destName.toLowerCase()) || destName.toLowerCase().includes(d.name.toLowerCase())
    ) || destinations[0];

    const destPlaces = places.filter((p) => p.destinationId === destObj.id);
    const available = destPlaces.length > 0 ? destPlaces : places;

    const itinerary: DayPlan[] = [];
    let currentCost = 0;

    for (let day = 1; day <= numDays; day++) {
      const dayActivities: Activity[] = [];
      const times = ['08:30', '11:45', '14:30', '19:00'];
      const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'high', 'low'];

      for (let i = 0; i < 4; i++) {
        const placeIdx = ((day - 1) * 4 + i) % available.length;
        const p = available[placeIdx];
        const cost = p.price || Math.floor((totalBudget / (numDays * 4)) * (0.6 + Math.random() * 0.5));
        currentCost += cost;

        dayActivities.push({
          id: crypto.randomUUID(),
          name: p.name,
          time: times[i],
          location: p.location,
          cost: cost,
          priority: priorities[i],
          category: p.category,
        });
      }

      itinerary.push({ day, activities: dayActivities });
    }

    return {
      id: crypto.randomUUID(),
      destination: destName,
      destinationId: destObj.id,
      coverImage: destObj.image,
      days: numDays,
      startDate,
      budget: totalBudget,
      estimated_cost: currentCost,
      within_budget: currentCost <= totalBudget,
      preferences: selectedPrefs,
      status: 'planning',
      travelers,
      itinerary,
      budgetBreakdown: {
        hotel: Math.round(totalBudget * 0.35),
        food: Math.round(totalBudget * 0.25),
        transport: Math.round(totalBudget * 0.15),
        activities: Math.round(totalBudget * 0.20),
        shopping: 0,
        other: Math.round(totalBudget * 0.05),
      },
      created_at: new Date().toISOString(),
    };
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      addNotification('Vui lòng nhập điểm đến!', 'warning');
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1400);

    try {
      // Try backend API first
      const res = await api.generate(destination, days, budget, selectedPrefs);
      const trip: Trip = {
        id: crypto.randomUUID(),
        destination: res.destination || destination,
        days: res.days || days,
        budget: res.budget || budget,
        estimated_cost: res.estimated_cost || Math.round(budget * 0.9),
        within_budget: res.within_budget ?? true,
        preferences: selectedPrefs,
        status: 'planning',
        startDate,
        travelers,
        coverImage: destinations.find((d) => d.name.toLowerCase().includes(destination.toLowerCase()))?.image ||
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
        itinerary: res.itinerary.map((d) => ({
          day: d.day,
          activities: d.activities.map((a) => ({
            id: a.id || crypto.randomUUID(),
            name: a.name,
            time: a.time || '09:00',
            location: a.location || destination,
            cost: a.cost || 0,
            priority: (a.priority as 'high' | 'medium' | 'low') || 'medium',
          })),
        })),
        budgetBreakdown: {
          hotel: Math.round(budget * 0.35),
          food: Math.round(budget * 0.25),
          transport: Math.round(budget * 0.15),
          activities: Math.round(budget * 0.20),
          shopping: 0,
          other: Math.round(budget * 0.05),
        },
        created_at: new Date().toISOString(),
      };
      setGeneratedTrip(trip);
    } catch {
      // Fallback with rich data generator
      const fallback = generateFallbackItinerary(destination, days, budget);
      setGeneratedTrip(fallback);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep(0);
    }
  }

  function handleSaveTrip() {
    if (!generatedTrip) return;
    addTrip(generatedTrip);
    navigate(`/trips/${generatedTrip.id}`);
  }

  function updateActivityPriority(dayIdx: number, actIdx: number, priority: 'high' | 'medium' | 'low') {
    if (!generatedTrip) return;
    const updated = { ...generatedTrip };
    const it = [...updated.itinerary];
    const day = { ...it[dayIdx] };
    const acts = [...day.activities];
    acts[actIdx] = { ...acts[actIdx], priority };
    day.activities = acts;
    it[dayIdx] = day;
    updated.itinerary = it;
    setGeneratedTrip(updated);
  }

  return (
    <div className="create-trip-page">
      <section className="page-header-banner planner-header">
        <div className="banner-content">
          <span className="badge-pill">AI Itinerary Generator 🧠✈️</span>
          <h1>Lên kế hoạch du lịch thông minh cùng AI</h1>
          <p>Chỉ cần chọn điểm đến, số ngày và ngân sách — AI sẽ tạo lịch trình hoàn chỉnh từ A đến Z!</p>
        </div>
      </section>

      <div className="page-container planner-layout">
        {/* Form Panel */}
        <div className="planner-form-card">
          <form onSubmit={handleGenerate}>
            {/* Destination Selection */}
            <div className="form-group">
              <label className="group-title">1. Bạn muốn đi đâu?</label>
              <div className="dest-chips-grid">
                {POPULAR_DESTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`dest-chip-btn ${destination === d.name ? 'active' : ''}`}
                    onClick={() => setDestination(d.name)}
                  >
                    <img src={d.image} alt={d.name} className="dest-chip-img" />
                    <span>{d.name}</span>
                  </button>
                ))}
              </div>
              <div className="custom-dest-input-wrap">
                <span className="input-icon">📍</span>
                <input
                  type="text"
                  placeholder="Hoặc nhập địa điểm khác (ví dụ: Phú Yên, Côn Đảo...)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Days & Start Date */}
            <div className="form-row">
              <div className="form-col">
                <label className="group-title">2. Số ngày đi</label>
                <div className="days-counter-row">
                  {[1, 2, 3, 4, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`day-btn ${days === d ? 'active' : ''}`}
                      onClick={() => setDays(d)}
                    >
                      {d} ngày
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-col">
                <label className="group-title">Ngày khởi hành</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="form-group">
              <div className="budget-header-row">
                <label className="group-title">3. Tổng ngân sách dự kiến</label>
                <span className="budget-amount-highlight">{budget.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="budget-presets-row">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`preset-btn ${budget === p.value ? 'active' : ''}`}
                    onClick={() => setBudget(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="1000000"
                max="25000000"
                step="500000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="budget-slider"
              />
            </div>

            {/* Travel Preferences */}
            <div className="form-group">
              <label className="group-title">4. Sở thích du lịch của bạn</label>
              <div className="prefs-grid">
                {PREFERENCE_OPTIONS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`pref-chip ${selectedPrefs.includes(p.key) ? 'selected' : ''}`}
                    onClick={() => togglePref(p.key)}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Travelers */}
            <div className="form-group">
              <label className="group-title">5. Số lượng thành viên</label>
              <div className="travelers-row">
                {[
                  { count: 1, label: 'Solo 1 mình' },
                  { count: 2, label: 'Cặp đôi (2 người)' },
                  { count: 4, label: 'Nhóm bạn (3-4 người)' },
                  { count: 6, label: 'Gia đình đông (5+ người)' },
                ].map((t) => (
                  <button
                    key={t.count}
                    type="button"
                    className={`traveler-btn ${travelers === t.count ? 'active' : ''}`}
                    onClick={() => setTravelers(t.count)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-generate-ai"
              disabled={loading}
            >
              {loading ? 'AI đang lên kế hoạch...' : '✨ Tạo lịch trình với TripMind AI'}
            </button>
          </form>
        </div>

        {/* Loading Animated State */}
        {loading && (
          <div className="ai-loading-overlay">
            <div className="loading-card">
              <div className="ai-spinner">🧠✈️</div>
              <h3>TripMind AI đang làm việc...</h3>
              <ul className="loading-steps">
                <li className={loadingStep >= 1 ? 'done' : ''}>
                  {loadingStep >= 1 ? '✓' : '○'} Phân tích sở thích & tối ưu ngân sách {budget.toLocaleString('vi-VN')}đ...
                </li>
                <li className={loadingStep >= 2 ? 'done' : ''}>
                  {loadingStep >= 2 ? '✓' : '○'} Chọn lọc địa điểm & quán ăn ngon nhất tại {destination}...
                </li>
                <li className={loadingStep >= 3 ? 'done' : ''}>
                  {loadingStep >= 3 ? '✓' : '○'} Lên timeline chi tiết cho {days} ngày khám phá...
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Result Preview */}
        {generatedTrip && !loading && (
          <div className="generated-result-card">
            <div className="result-header">
              <div>
                <span className="badge-pill">Lịch trình đã sẵn sàng!</span>
                <h2>{generatedTrip.destination} — {generatedTrip.days} Ngày</h2>
                <div className="result-meta">
                  <span>💰 Ngân sách: {generatedTrip.budget.toLocaleString('vi-VN')}đ</span>
                  <span>💸 Dự tính: {generatedTrip.estimated_cost.toLocaleString('vi-VN')}đ</span>
                  <span className={`budget-tag ${generatedTrip.within_budget ? 'ok' : 'warn'}`}>
                    {generatedTrip.within_budget ? '✓ Trong ngân sách' : '⚠️ Vượt ngân sách'}
                  </span>
                </div>
              </div>
              <button className="btn-primary-large" onClick={handleSaveTrip}>
                💾 Lưu vào Chuyến đi của tôi →
              </button>
            </div>

            {/* Timeline preview */}
            <div className="itinerary-timeline">
              {generatedTrip.itinerary.map((day, dIdx) => (
                <div key={day.day} className="day-block">
                  <h3 className="day-title">📅 Ngày {day.day}</h3>
                  <div className="activities-list">
                    {day.activities.map((act, aIdx) => (
                      <div key={act.id || aIdx} className="activity-card">
                        <div className="act-time">{act.time || '09:00'}</div>
                        <div className="act-details">
                          <h4>{act.name}</h4>
                          <span className="act-loc">📍 {act.location}</span>
                          <span className="act-cost">💰 {act.cost.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="act-priority">
                          <label>Ưu tiên:</label>
                          <select
                            value={act.priority}
                            onChange={(e) =>
                              updateActivityPriority(
                                dIdx,
                                aIdx,
                                e.target.value as 'high' | 'medium' | 'low'
                              )
                            }
                          >
                            <option value="high">Cao ▲</option>
                            <option value="medium">Vừa ■</option>
                            <option value="low">Thấp ▽</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="result-bottom-cta">
              <button className="btn-primary-large" onClick={handleSaveTrip}>
                🚀 Lưu & Bắt đầu chuyến đi này!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
