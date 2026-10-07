import { useState, useMemo } from 'react';
import { places } from '../data/places';
import { destinations } from '../data/destinations';
import { PlaceCard } from '../components/Cards';
import { useApp } from '../context/AppContext';

export default function RestaurantsPage() {
  const [selectedDest, setSelectedDest] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { addNotification } = useApp();

  const foodPlaces = useMemo(() => {
    return places.filter((p) => p.category === 'restaurant' || p.category === 'cafe');
  }, []);

  const filteredPlaces = useMemo(() => {
    return foodPlaces.filter((p) => {
      if (selectedDest !== 'all' && p.destinationId !== selectedDest) return false;
      if (selectedType === 'cafe' && p.category !== 'cafe') return false;
      if (selectedType === 'restaurant' && p.category !== 'restaurant') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mLoc = p.location.toLowerCase().includes(q);
        const mTag = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!mName && !mLoc && !mTag) return false;
      }
      return true;
    });
  }, [foodPlaces, selectedDest, selectedType, searchQuery]);

  return (
    <div className="restaurants-page">
      <section className="page-header-banner food-header">
        <div className="banner-content">
          <span className="badge-pill">Bản đồ ẩm thực 🍜</span>
          <h1>Tinh hoa ẩm thực & Quán cafe tuyệt đẹp</h1>
          <p>Thưởng thức những món ngon đặc sản 3 miền và khám phá những quán cafe có view sống ảo cực đỉnh</p>

          <div className="header-search-box">
            <span className="search-icon">🍜</span>
            <input
              type="text"
              placeholder="Tìm món ngon: Bánh căn, Mì Quảng, Cafe trứng, Hải sản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </section>

      <div className="page-container explore-layout">
        <aside className="filters-sidebar">
          <div className="filter-card">
            <div className="filter-header">
              <h3>Bộ lọc ẩm thực</h3>
              <button
                className="btn-text"
                onClick={() => {
                  setSelectedDest('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
              >
                Đặt lại
              </button>
            </div>

            <div className="filter-group">
              <label>Điểm đến</label>
              <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)}>
                <option value="all">Tất cả điểm đến</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Loại hình</label>
              <div className="rating-pills">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'restaurant', label: '🍜 Nhà hàng' },
                  { key: 'cafe', label: '☕ Quán Cafe' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`pill-btn ${selectedType === item.key ? 'active' : ''}`}
                    onClick={() => setSelectedType(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="explore-main">
          <div className="results-header">
            <h2>Tìm thấy {filteredPlaces.length} quán ăn & đồ uống</h2>
            <span className="sort-hint">Được AI tuyển chọn</span>
          </div>

          {filteredPlaces.length > 0 ? (
            <div className="places-grid">
              {filteredPlaces.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  onAddToTrip={(pl) => addNotification(`Đã thêm ${pl.name} vào danh sách dự định!`, 'success')}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <div className="empty-icon">🍽️</div>
              <h3>Không tìm thấy quán phù hợp</h3>
              <p>Hãy thử tìm với từ khóa ẩm thực khác nhé.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
