import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { places } from '../data/places';
import { PlaceCard } from '../components/Cards';
import { useApp } from '../context/AppContext';

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, savedTrips, updateTrip, addNotification } = useApp();

  const place = places.find((p) => p.id === id);
  const [showTripModal, setShowTripModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!place) {
    return (
      <div className="page-container empty-state-container">
        <h2>Không tìm thấy địa điểm</h2>
        <p>Địa điểm này không tồn tại hoặc đã bị xóa.</p>
        <button className="btn-primary" onClick={() => navigate('/explore')}>
          Quay lại Khám phá
        </button>
      </div>
    );
  }

  const currentPlace = place;
  const fav = isFavorite(currentPlace.id);
  const nearby = places
    .filter((p) => p.id !== currentPlace.id && (currentPlace.nearbyPlaces?.includes(p.id) || p.destinationId === currentPlace.destinationId))
    .slice(0, 3);

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    addNotification('Đã sao chép liên kết vào bộ nhớ tạm!', 'info');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddToTrip(tripId: string) {
    const target = savedTrips.find((t) => t.id === tripId);
    if (!target) return;

    const newActivity = {
      id: crypto.randomUUID(),
      name: currentPlace.name,
      location: currentPlace.location,
      cost: currentPlace.price,
      priority: 'high' as const,
      category: currentPlace.category,
      time: '14:00',
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
      estimated_cost: target.estimated_cost + currentPlace.price,
    });

    addNotification(`Đã thêm "${currentPlace.name}" vào chuyến đi ${target.destination}!`, 'success');
    setShowTripModal(false);
  }

  return (
    <div className="place-detail-page">
      {/* Breadcrumb */}
      <div className="page-container breadcrumb-row">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/explore">Khám phá</Link>
        <span>/</span>
        <span className="current">{place.name}</span>
      </div>

      <div className="page-container detail-layout">
        {/* Gallery */}
        <div className="detail-media-gallery">
          <div className="main-image-wrap">
            <img
              src={place.image}
              alt={place.name}
              className="main-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=70';
              }}
            />
          </div>
          {place.images && place.images.length > 1 && (
            <div className="thumbnails-grid">
              {place.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${place.name} - ${idx}`}
                  className="thumb-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=70';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content & Actions */}
        <div className="detail-info-card">
          <div className="detail-header-meta">
            <span className="cat-pill">📍 {place.category.toUpperCase()}</span>
            <div className="action-buttons-group">
              <button
                className={`icon-btn ${fav ? 'active' : ''}`}
                onClick={() => toggleFavorite(place.id)}
                title={fav ? 'Bỏ lưu' : 'Lưu vào yêu thích'}
              >
                {fav ? '❤️ Đã lưu' : '🤍 Lưu'}
              </button>
              <button className="icon-btn" onClick={handleShare} title="Chia sẻ liên kết">
                {copied ? '✅ Đã chép' : '🔗 Chia sẻ'}
              </button>
            </div>
          </div>

          <h1 className="detail-title">{place.name}</h1>
          <div className="detail-rating-row">
            <span className="stars">⭐ {place.rating}</span>
            <span className="reviews">({place.reviewCount.toLocaleString()} lượt đánh giá)</span>
            <span className="dot">•</span>
            <span className="location">📍 {place.location}</span>
          </div>

          <div className="detail-price-box">
            <div className="price-item">
              <span className="label">Giá vé / Chi phí dự kiến</span>
              <span className="price-amount">
                {place.priceLabel ?? `${place.price.toLocaleString('vi-VN')} VNĐ`}
              </span>
            </div>
            <button
              className="btn-primary-large"
              onClick={() => {
                if (savedTrips.length === 0) {
                  addNotification('Bạn chưa có chuyến đi nào. Vui lòng tạo chuyến đi trước!', 'warning');
                  navigate('/create-trip');
                } else {
                  setShowTripModal(true);
                }
              }}
            >
              ➕ Thêm vào lịch trình của tôi
            </button>
          </div>

          {/* AI Suggestion Box */}
          {place.aiSuggestion && (
            <div className="ai-tip-box">
              <div className="ai-tip-header">
                <span className="ai-sparkle">✨</span>
                <strong>TripMind AI Gợi ý trải nghiệm</strong>
              </div>
              <p>{place.aiSuggestion}</p>
            </div>
          )}

          {/* Details list */}
          <div className="meta-info-grid">
            {place.address && (
              <div className="meta-info-item">
                <span className="icon">🗺️</span>
                <div>
                  <strong>Địa chỉ chi tiết</strong>
                  <p>{place.address}</p>
                </div>
              </div>
            )}
            {place.openHours && (
              <div className="meta-info-item">
                <span className="icon">⏰</span>
                <div>
                  <strong>Giờ hoạt động</strong>
                  <p>{place.openHours}</p>
                </div>
              </div>
            )}
            {place.phone && (
              <div className="meta-info-item">
                <span className="icon">📞</span>
                <div>
                  <strong>Liên hệ</strong>
                  <p>{place.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="detail-description-section">
            <h3>Giới thiệu</h3>
            <p>{place.description}</p>
          </div>

          {/* Tags */}
          <div className="tags-section">
            {place.tags.map((t) => (
              <span key={t} className="tag-pill">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Places Section */}
      {nearby.length > 0 && (
        <section className="page-container nearby-section">
          <div className="section-header">
            <h2>Gợi ý địa điểm lân cận</h2>
            <Link to={`/explore?destination=${place.destinationId}`} className="link-more">
              Xem thêm tại khu vực này →
            </Link>
          </div>
          <div className="places-grid">
            {nearby.map((np) => (
              <PlaceCard key={np.id} place={np} />
            ))}
          </div>
        </section>
      )}

      {/* Add To Trip Modal */}
      {showTripModal && (
        <div className="modal-overlay" onClick={() => setShowTripModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn chuyến đi để thêm địa điểm</h3>
              <button className="close-btn" onClick={() => setShowTripModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Thêm <strong>{place.name}</strong> vào:</p>
              <div className="trip-select-list">
                {savedTrips.map((trip) => (
                  <button
                    key={trip.id}
                    className="trip-select-item"
                    onClick={() => handleAddToTrip(trip.id)}
                  >
                    <div>
                      <strong>{trip.destination}</strong>
                      <span className="sub-text">({trip.days} ngày)</span>
                    </div>
                    <span className="arrow">➕ Thêm vào Ngày 1</span>
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
