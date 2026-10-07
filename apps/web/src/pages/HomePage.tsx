import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { places } from '../data/places';
import { useAuth } from '../context/AuthContext';
import { PlaceCard } from '../components/Cards';

const CATEGORIES = [
  { id: 'all', label: '🌟 Tất cả', tag: 'all' },
  { id: 'nature', label: '🌿 Thiên nhiên', tag: 'thiên nhiên' },
  { id: 'food', label: '🍜 Ẩm thực', tag: 'ẩm thực' },
  { id: 'culture', label: '🏛 Văn hóa', tag: 'văn hóa' },
  { id: 'beach', label: '🏖 Biển', tag: 'biển' },
  { id: 'cafe', label: '☕ Cà phê', tag: 'cà phê' },
  { id: 'shopping', label: '🛍 Mua sắm', tag: 'mua sắm' },
  { id: 'checkin', label: '📸 Check-in', tag: 'check-in' },
];

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [destination, setDestination] = useState('Đà Lạt');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('3m-5m');
  const [style, setStyle] = useState<string[]>(['Thiên nhiên']);

  const filteredDests =
    selectedCat === 'all'
      ? destinations
      : destinations.filter((d) =>
          d.tags.some((t) => t === CATEGORIES.find((c) => c.id === selectedCat)?.tag)
        );

  const featuredPlaces = places.slice(0, 6);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(searchQ)}`);
  }

  function handleCreateTrip(e: FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    navigate('/create-trip', { state: { destination, days, budget, style } });
  }

  const toggleStyle = (s: string) =>
    setStyle((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">✨ AI Travel Planning Copilot</div>
          <h1 className="hero-title">
            Du lịch thông minh hơn<br />với <span className="text-teal">TripMind AI</span>
          </h1>
          <p className="hero-sub">
            Lên kế hoạch chuyến đi theo sở thích, ngân sách và thời gian của bạn —<br />
            chỉ trong vài phút với sức mạnh của AI.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm điểm đến, khách sạn, nhà hàng..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <button type="submit">🔍 Tìm kiếm</button>
          </form>
          <div className="hero-ctas">
            <button className="cta-primary" onClick={() => isLoggedIn ? navigate('/trips/create') : navigate('/login')}>
              ✨ Tạo chuyến đi với AI
            </button>
            <button className="cta-secondary" onClick={() => navigate('/explore')}>
              🗺️ Khám phá điểm đến
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section className="section">
        <div className="section-header">
          <h2>Điểm đến nổi bật</h2>
          <button className="see-all" onClick={() => navigate('/explore')}>Xem tất cả →</button>
        </div>

        {/* Category filter */}
        <div className="category-chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip ${selectedCat === c.id ? 'on' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="dest-grid">
          {filteredDests.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              className="dest-card"
              onClick={() => navigate(`/explore?dest=${dest.id}`)}
            >
              <div className="dest-card-img-wrap">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70';
                  }}
                />
                <div className="dest-card-overlay">
                  <span className="dest-rating">⭐ {dest.rating}</span>
                </div>
              </div>
              <div className="dest-card-info">
                <h3>{dest.name}</h3>
                <p className="dest-province">{dest.province}</p>
                <p className="dest-desc">{dest.description.slice(0, 70)}…</p>
                <div className="dest-meta">
                  <span>{dest.placesCount} địa điểm</span>
                  <button className="explore-btn">Khám phá →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI PLANNER ── */}
      <section className="ai-planner-section">
        <div className="ai-planner-inner">
          <div className="ai-planner-text">
            <div className="section-badge">🤖 AI Powered</div>
            <h2>Để AI lên kế hoạch cho bạn</h2>
            <p>
              Chỉ cần nhập điểm đến, số ngày và ngân sách — TripMind AI sẽ tự động
              tạo lịch trình chi tiết theo từng ngày, tối ưu chi phí và phù hợp sở thích.
            </p>
            <div className="ai-steps">
              <div className="ai-step"><span>1</span> Nhập thông tin chuyến đi</div>
              <div className="ai-step"><span>2</span> AI phân tích & tối ưu</div>
              <div className="ai-step"><span>3</span> Nhận lịch trình hoàn chỉnh</div>
            </div>
          </div>
          <form className="ai-planner-form" onSubmit={handleCreateTrip}>
            <div className="form-group">
              <label>🗺️ Đi đâu?</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Đà Lạt, Hà Nội, Phú Quốc..."
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>📅 Số ngày</label>
                <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(+e.target.value)} />
              </div>
              <div className="form-group">
                <label>💰 Ngân sách</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="under1m">Dưới 1 triệu</option>
                  <option value="1m-3m">1 – 3 triệu</option>
                  <option value="3m-5m">3 – 5 triệu</option>
                  <option value="5m-10m">5 – 10 triệu</option>
                  <option value="over10m">Trên 10 triệu</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>🎯 Phong cách</label>
              <div className="style-chips">
                {['Thiên nhiên', 'Ẩm thực', 'Văn hóa', 'Biển', 'Check-in', 'Cà phê'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${style.includes(s) ? 'on' : ''}`}
                    onClick={() => toggleStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-generate">
              ✨ Tạo lịch trình bằng AI
            </button>
          </form>
        </div>
      </section>

      {/* ── POPULAR PLACES ── */}
      <section className="section">
        <div className="section-header">
          <h2>Địa điểm được yêu thích</h2>
          <button className="see-all" onClick={() => navigate('/explore')}>Xem tất cả →</button>
        </div>
        <div className="cards-grid">
          {featuredPlaces.map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <h2>Cách TripMind AI hoạt động</h2>
        <div className="how-steps">
          {[
            { icon: '🗺️', title: 'Chọn điểm đến', desc: 'Khám phá hàng trăm địa điểm trên cả nước.' },
            { icon: '✨', title: 'AI lên kế hoạch', desc: 'AI tạo lịch trình chi tiết theo sở thích và ngân sách.' },
            { icon: '✏️', title: 'Tùy chỉnh thoải mái', desc: 'Thêm, xóa, chỉnh sửa lịch trình theo ý muốn.' },
            { icon: '🚀', title: 'Lên đường thôi!', desc: 'Lưu và chia sẻ lịch trình cho cả nhóm.' },
          ].map((s, i) => (
            <div key={i} className="how-step">
              <div className="how-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2>Sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p>Hàng nghìn người dùng đã lập kế hoạch du lịch thông minh hơn với TripMind AI.</p>
          <button
            className="cta-primary"
            onClick={() => isLoggedIn ? navigate('/trips/create') : navigate('/register')}
          >
            ✨ {isLoggedIn ? 'Tạo chuyến đi mới' : 'Bắt đầu miễn phí'}
          </button>
        </div>
      </section>
    </div>
  );
}
