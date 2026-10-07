import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { places } from '../data/places';
import { destinations } from '../data/destinations';
import { PlaceCard } from '../components/Cards';
import type { PlaceCategory, Place } from '../types';
import { useApp } from '../context/AppContext';

const CATEGORIES: { key: PlaceCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Tất cả', icon: '🌟' },
  { key: 'attraction', label: 'Điểm tham quan', icon: '📍' },
  { key: 'restaurant', label: 'Nhà hàng', icon: '🍜' },
  { key: 'cafe', label: 'Quán cafe', icon: '☕' },
  { key: 'activity', label: 'Hoạt động trải nghiệm', icon: '🎯' },
  { key: 'shopping', label: 'Mua sắm & Chợ', icon: '🛍️' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDest = searchParams.get('destination') || 'all';
  const initialCat = (searchParams.get('category') as PlaceCategory) || 'all';

  const [selectedDest, setSelectedDest] = useState<string>(initialDest);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<number>(1000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<Place | null>(null);

  const { savedTrips, updateTrip, addNotification } = useApp();

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (selectedDest !== 'all' && p.destinationId !== selectedDest) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (p.rating < minRating) return false;
      if (p.price > priceFilter && priceFilter < 1000000) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchTag) return false;
      }
      return true;
    });
  }, [selectedDest, selectedCategory, searchQuery, priceFilter, minRating]);

  function handleAddToTrip(place: Place) {
    if (savedTrips.length === 0) {
      addNotification('Bạn chưa có chuyến đi nào. Hãy tạo chuyến đi mới trước nhé!', 'warning');
      return;
    }
    setSelectedPlaceModal(place);
  }

  function confirmAddToTrip(tripId: string) {
    if (!selectedPlaceModal) return;
    const target = savedTrips.find((t) => t.id === tripId);
    if (!target) return;

    const newActivity = {
      id: crypto.randomUUID(),
      name: selectedPlaceModal.name,
      location: selectedPlaceModal.location,
      cost: selectedPlaceModal.price,
      priority: 'medium' as const,
      category: selectedPlaceModal.category,
      time: '09:00',
    };

    const updatedItinerary = [...target.itinerary];
    if (updatedItinerary.length === 0) {
      updatedItinerary.push({ day: 1, activities: [newActivity] });
    } else {
      updatedItinerary[0] = {
        ...updatedItinerary[0],
        activities: [...updatedItinerary[0].activities, newActivity],
      };
    }

    updateTrip({
      ...target,
      itinerary: updatedItinerary,
      estimated_cost: target.estimated_cost + selectedPlaceModal.price,
    });

    addNotification(`Đã thêm "${selectedPlaceModal.name}" vào chuyến đi ${target.destination}!`, 'success');
    setSelectedPlaceModal(null);
  }

  return (
    <div className="explore-page">
      {/* Header Banner */}
      <section className="page-header-banner">
        <div className="banner-content">
          <span className="badge-pill">Khám phá Việt Nam 🇻🇳</span>
          <h1>Điểm đến & Hoạt động hấp dẫn</h1>
          <p>Tìm kiếm hàng trăm địa điểm du lịch, ẩm thực, check-in được gợi ý thông minh bởi TripMind AI</p>
          
          <div className="header-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên địa điểm, thành phố, món ăn, hoạt động..."
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
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-card">
            <div className="filter-header">
              <h3>Bộ lọc tìm kiếm</h3>
              <button
                className="btn-text"
                onClick={() => {
                  setSelectedDest('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceFilter(1000000);
                  setMinRating(0);
                }}
              >
                Đặt lại
              </button>
            </div>

            {/* Destination filter */}
            <div className="filter-group">
              <label>Điểm đến (Thành phố)</label>
              <select
                value={selectedDest}
                onChange={(e) => {
                  setSelectedDest(e.target.value);
                  setSearchParams({ destination: e.target.value, category: selectedCategory });
                }}
              >
                <option value="all">Tất cả điểm đến</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Price filter */}
            <div className="filter-group">
              <div className="filter-label-row">
                <label>Chi phí tối đa</label>
                <span className="filter-val">
                  {priceFilter >= 1000000 ? 'Tất cả giá' : `${priceFilter.toLocaleString('vi-VN')}đ`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="50000"
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
              />
              <div className="range-hints">
                <span>Miễn phí</span>
                <span>500k</span>
                <span>1 triệu+</span>
              </div>
            </div>

            {/* Rating filter */}
            <div className="filter-group">
              <label>Đánh giá tối thiểu</label>
              <div className="rating-pills">
                {[0, 4.0, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`pill-btn ${minRating === r ? 'active' : ''}`}
                    onClick={() => setMinRating(r)}
                  >
                    {r === 0 ? 'Tất cả' : `⭐ ${r}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="explore-main">
          {/* Category Tabs */}
          <div className="category-scroll-bar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`cat-tab-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSearchParams({ destination: selectedDest, category: cat.key });
                }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Results summary */}
          <div className="results-header">
            <h2>
              Kết quả ({filteredPlaces.length})
              {selectedDest !== 'all' && (
                <span className="tag-highlight">
                  tại {destinations.find((d) => d.id === selectedDest)?.name}
                </span>
              )}
            </h2>
            <span className="sort-hint">Sắp xếp: Phổ biến nhất</span>
          </div>

          {/* Grid */}
          {filteredPlaces.length > 0 ? (
            <div className="places-grid">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onAddToTrip={handleAddToTrip}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <div className="empty-icon">🏖️</div>
              <h3>Không tìm thấy địa điểm phù hợp</h3>
              <p>Hãy thử nới lỏng bộ lọc hoặc tìm kiếm từ khóa khác.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedDest('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setPriceFilter(1000000);
                  setMinRating(0);
                }}
              >
                Xem tất cả địa điểm
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add To Trip Modal */}
      {selectedPlaceModal && (
        <div className="modal-overlay" onClick={() => setSelectedPlaceModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm vào chuyến đi của bạn</h3>
              <button className="close-btn" onClick={() => setSelectedPlaceModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Chọn chuyến đi bạn muốn thêm <strong>{selectedPlaceModal.name}</strong>:</p>
              <div className="trip-select-list">
                {savedTrips.map((trip) => (
                  <button
                    key={trip.id}
                    className="trip-select-item"
                    onClick={() => confirmAddToTrip(trip.id)}
                  >
                    <div>
                      <strong>{trip.destination}</strong>
                      <span className="sub-text">({trip.days} ngày · {trip.status})</span>
                    </div>
                    <span className="arrow">➕</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
