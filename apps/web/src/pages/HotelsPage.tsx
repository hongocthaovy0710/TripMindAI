import { useState, useMemo, type FormEvent } from 'react';
import { hotels } from '../data/hotels';
import { destinations } from '../data/destinations';
import { HotelCard } from '../components/Cards';
import type { AccommodationType, Hotel } from '../types';
import { useApp } from '../context/AppContext';

export default function HotelsPage() {
  const [selectedDest, setSelectedDest] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<AccommodationType | 'all'>('all');
  const [priceMax, setPriceMax] = useState<number>(6000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [bookingDates, setBookingDates] = useState({ checkIn: '2026-10-15', checkOut: '2026-10-18', guests: 2 });
  const [isBooked, setIsBooked] = useState(false);

  const { addNotification } = useApp();

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.amenities.forEach((a) => set.add(a)));
    return Array.from(set);
  }, []);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (selectedDest !== 'all' && h.destinationId !== selectedDest) return false;
      if (selectedType !== 'all' && h.type !== selectedType) return false;
      if (h.pricePerNight > priceMax) return false;
      if (h.rating < minRating) return false;
      if (selectedAmenity !== 'all' && !h.amenities.includes(selectedAmenity)) return false;
      return true;
    });
  }, [selectedDest, selectedType, priceMax, minRating, selectedAmenity]);

  function handleConfirmBooking(e: FormEvent) {
    e.preventDefault();
    if (!bookingHotel) return;
    setIsBooked(true);
    addNotification(`Đặt phòng thành công tại ${bookingHotel.name}! Đã gửi email xác nhận.`, 'success');
    setTimeout(() => {
      setIsBooked(false);
      setBookingHotel(null);
    }, 2000);
  }

  return (
    <div className="hotels-page">
      {/* Header Banner */}
      <section className="page-header-banner hotels-header">
        <div className="banner-content">
          <span className="badge-pill">Lưu trú & Nghỉ dưỡng 🏨</span>
          <h1>Khách sạn & Homestay được yêu thích nhất</h1>
          <p>Từ homestay đồi thông thơ mộng đến resort ven biển 5 sao đẳng cấp với giá tốt nhất</p>
        </div>
      </section>

      <div className="page-container explore-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-card">
            <div className="filter-header">
              <h3>Bộ lọc lưu trú</h3>
              <button
                className="btn-text"
                onClick={() => {
                  setSelectedDest('all');
                  setSelectedType('all');
                  setPriceMax(6000000);
                  setMinRating(0);
                  setSelectedAmenity('all');
                }}
              >
                Đặt lại
              </button>
            </div>

            {/* Destination */}
            <div className="filter-group">
              <label>Điểm đến</label>
              <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)}>
                <option value="all">Tất cả điểm đến</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Price Max */}
            <div className="filter-group">
              <div className="filter-label-row">
                <label>Giá mỗi đêm (Tối đa)</label>
                <span className="filter-val">{priceMax.toLocaleString('vi-VN')}đ</span>
              </div>
              <input
                type="range"
                min="300000"
                max="6000000"
                step="200000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </div>

            {/* Rating */}
            <div className="filter-group">
              <label>Đánh giá sao</label>
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

            {/* Amenities */}
            <div className="filter-group">
              <label>Tiện nghi nổi bật</label>
              <select value={selectedAmenity} onChange={(e) => setSelectedAmenity(e.target.value)}>
                <option value="all">Tất cả tiện nghi</option>
                {allAmenities.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Main List */}
        <main className="explore-main">
          {/* Type filters */}
          <div className="category-scroll-bar">
            {[
              { key: 'all', label: 'Tất cả', icon: '🏡' },
              { key: 'hotel', label: 'Khách sạn', icon: '🏨' },
              { key: 'homestay', label: 'Homestay', icon: '🏠' },
              { key: 'villa', label: 'Biệt thự / Villa', icon: '🏰' },
              { key: 'hostel', label: 'Hostel giá rẻ', icon: '🛏️' },
            ].map((t) => (
              <button
                key={t.key}
                className={`cat-tab-btn ${selectedType === t.key ? 'active' : ''}`}
                onClick={() => setSelectedType(t.key as AccommodationType | 'all')}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="results-header">
            <h2>Tìm thấy {filteredHotels.length} địa điểm lưu trú</h2>
            <span className="sort-hint">Cam kết giá tốt & AI đề xuất</span>
          </div>

          {filteredHotels.length > 0 ? (
            <div className="places-grid">
              {filteredHotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  onAddToTrip={(hotel) => setBookingHotel(hotel)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <div className="empty-icon">🏨</div>
              <h3>Không có phòng nào phù hợp với bộ lọc</h3>
              <p>Vui lòng nâng mức giá tối đa hoặc chọn điểm đến khác.</p>
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {bookingHotel && (
        <div className="modal-overlay" onClick={() => !isBooked && setBookingHotel(null)}>
          <div className="modal-dialog booking-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đặt phòng tại {bookingHotel.name}</h3>
              <button className="close-btn" onClick={() => setBookingHotel(null)}>✕</button>
            </div>
            {isBooked ? (
              <div className="modal-success-body">
                <div className="success-icon">🎉</div>
                <h3>Đặt phòng thành công!</h3>
                <p>Mã đặt phòng <strong>#TM-{Math.floor(100000 + Math.random() * 900000)}</strong> đã được ghi nhận.</p>
                <p className="sub-text">TripMind AI đã tự động cập nhật chi phí lưu trú vào kế hoạch của bạn.</p>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleConfirmBooking}>
                <div className="hotel-brief">
                  <img src={bookingHotel.image} alt={bookingHotel.name} className="hotel-brief-img" />
                  <div>
                    <h4>{bookingHotel.name}</h4>
                    <p>📍 {bookingHotel.location}</p>
                    <p className="price-bold">{bookingHotel.pricePerNight.toLocaleString('vi-VN')}đ / đêm</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <label>Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={bookingDates.checkIn}
                      onChange={(e) => setBookingDates({ ...bookingDates, checkIn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-col">
                    <label>Ngày trả phòng</label>
                    <input
                      type="date"
                      value={bookingDates.checkOut}
                      onChange={(e) => setBookingDates({ ...bookingDates, checkOut: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số lượng khách</label>
                  <select
                    value={bookingDates.guests}
                    onChange={(e) => setBookingDates({ ...bookingDates, guests: Number(e.target.value) })}
                  >
                    <option value={1}>1 người (Phòng đơn)</option>
                    <option value={2}>2 người (Phòng đôi)</option>
                    <option value={4}>3 - 4 người (Gia đình / Nhóm)</option>
                    <option value={6}>5+ người (Villa nguyên căn)</option>
                  </select>
                </div>

                <div className="booking-summary-box">
                  <div className="row">
                    <span>Thời gian lưu trú dự kiến:</span>
                    <strong>3 đêm</strong>
                  </div>
                  <div className="row total">
                    <span>Tổng tạm tính:</span>
                    <strong className="text-primary">{(bookingHotel.pricePerNight * 3).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>

                <button type="submit" className="btn-primary-large">
                  Xác nhận đặt giữ chỗ ngay 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
