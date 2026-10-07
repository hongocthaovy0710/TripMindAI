import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hotels } from '../data/hotels';
import { useApp } from '../context/AppContext';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, addNotification } = useApp();

  const hotel = hotels.find((h) => h.id === id);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hotel) {
    return (
      <div className="page-container empty-state-container">
        <h2>Không tìm thấy khách sạn</h2>
        <p>Khách sạn này không tồn tại hoặc đã ngừng phục vụ.</p>
        <button className="btn-primary" onClick={() => navigate('/hotels')}>
          Quay lại danh sách khách sạn
        </button>
      </div>
    );
  }

  const fav = isFavorite(hotel.id);
  const totalCost = hotel.pricePerNight * nights;

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    addNotification('Đã sao chép liên kết khách sạn!', 'info');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleBook(e: FormEvent) {
    e.preventDefault();
    setIsBooked(true);
    addNotification(`Đặt phòng thành công tại ${hotel?.name}!`, 'success');
  }

  return (
    <div className="hotel-detail-page">
      <div className="page-container breadcrumb-row">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/hotels">Khách sạn</Link>
        <span>/</span>
        <span className="current">{hotel.name}</span>
      </div>

      <div className="page-container detail-layout">
        <div className="detail-media-gallery">
          <div className="main-image-wrap">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="main-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=70';
              }}
            />
          </div>
          {hotel.images && hotel.images.length > 1 && (
            <div className="thumbnails-grid">
              {hotel.images.map((img, idx) => (
                <img key={idx} src={img} alt="" className="thumb-img" />
              ))}
            </div>
          )}

          <div className="hotel-extra-info">
            <h3>Tiện nghi có sẵn</h3>
            <div className="amenities-grid">
              {hotel.amenities.map((a) => (
                <div key={a} className="amenity-item">
                  <span className="icon">✓</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>

            <h3>Chính sách nhận & trả phòng</h3>
            <ul className="policies-list">
              <li>⏰ Nhận phòng từ <strong>14:00</strong></li>
              <li>⏰ Trả phòng trước <strong>12:00</strong></li>
              <li>🚭 Không hút thuốc trong phòng ngủ</li>
              <li>🐾 Hỗ trợ gửi hành lý trước giờ check-in</li>
            </ul>
          </div>
        </div>

        {/* Sidebar Booking Card */}
        <div className="detail-info-card">
          <div className="detail-header-meta">
            <span className="cat-pill">🏨 {hotel.type.toUpperCase()}</span>
            <div className="action-buttons-group">
              <button
                className={`icon-btn ${fav ? 'active' : ''}`}
                onClick={() => toggleFavorite(hotel.id)}
              >
                {fav ? '❤️ Đã lưu' : '🤍 Lưu'}
              </button>
              <button className="icon-btn" onClick={handleShare}>
                {copied ? '✅ Đã chép' : '🔗 Chia sẻ'}
              </button>
            </div>
          </div>

          <h1 className="detail-title">{hotel.name}</h1>
          <div className="detail-rating-row">
            <span className="stars">⭐ {hotel.rating}</span>
            <span className="reviews">({hotel.reviewCount.toLocaleString()} đánh giá)</span>
            <span className="dot">•</span>
            <span className="location">📍 {hotel.location}</span>
          </div>

          <div className="detail-price-box">
            <div className="price-item">
              <span className="label">Giá mỗi đêm</span>
              <span className="price-amount">{hotel.pricePerNight.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          <p className="detail-desc-text">{hotel.description}</p>

          {/* Booking Widget Box */}
          <div className="booking-widget-box">
            <h3>Đặt phòng trực tuyến</h3>
            {isBooked ? (
              <div className="booking-confirmed-box">
                <div className="success-icon">🎉</div>
                <h4>Đặt phòng thành công!</h4>
                <p>Cảm ơn bạn. Hướng dẫn check-in sẽ được gửi trước ngày đến.</p>
                <button className="btn-secondary" onClick={() => setIsBooked(false)}>Đặt phòng khác</button>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label>Số đêm nghỉ</label>
                  <div className="counter-row">
                    <button
                      type="button"
                      className="btn-counter"
                      onClick={() => setNights(Math.max(1, nights - 1))}
                    >
                      -
                    </button>
                    <span className="counter-val">{nights} đêm</span>
                    <button
                      type="button"
                      className="btn-counter"
                      onClick={() => setNights(nights + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Số người</label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    <option value={1}>1 khách</option>
                    <option value={2}>2 khách</option>
                    <option value={3}>3 khách</option>
                    <option value={4}>4 khách</option>
                  </select>
                </div>

                <div className="price-summary-breakdown">
                  <div className="line">
                    <span>{hotel.pricePerNight.toLocaleString('vi-VN')}đ × {nights} đêm:</span>
                    <span>{totalCost.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="line">
                    <span>Phí dịch vụ & dọn dẹp:</span>
                    <span className="text-free">Miễn phí</span>
                  </div>
                  <div className="line total">
                    <span>Tổng cộng:</span>
                    <strong className="text-primary">{totalCost.toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>

                <button type="submit" className="btn-primary-large">
                  Xác nhận đặt ngay ⚡
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
